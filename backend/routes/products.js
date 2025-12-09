const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const mongoose = require("mongoose");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all listing management routes
const listingRouter = express.Router();
listingRouter.use(authenticateToken);

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get all products (public)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 50,
      minPrice,
      maxPrice,
    } = req.query;

    let query = {};

    // Category filter
    if (category && category !== "all") {
      query.category = { $regex: category, $options: "i" };
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get products by category (public) - Moved before /:id route
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const products = await Product.find({
      category: { $regex: category, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      category: { $regex: category, $options: "i" },
    });

    res.json({
      success: true,
      data: products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ============================================
// LISTING MANAGEMENT ROUTES (Authentication required)
// ============================================

// Create a new listing
listingRouter.post("/create", async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const {
      title,
      price,
      category,
      description,
      image,
      stock,
      features,
      reviews,
    } = req.body;

    // Validation
    if (!title || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and category are required fields",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create the product
    const newProduct = new Product({
      title,
      price: parseFloat(price),
      category,
      description: description || "",
      image: image || "",
      stock: stock || 0,
      features: Array.isArray(features) ? features : [],
      reviews: reviews || "",
      rating: {
        rate: 0,
        count: 0,
      },
      createdBy: userId,
    });

    // Save the product
    const savedProduct = await newProduct.save();

    // Add product to user's listings
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          listings: {
            productId: savedProduct._id,
            status: "active",
          },
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create listing",
      error: error.message,
    });
  }
});

// Get user's own listings
// Get user's own listings - Add debugging
listingRouter.get("/my-listings", async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    console.log("=== GET MY-LISTINGS DEBUG ===");
    console.log("Authenticated User ID:", userId);
    console.log("User from token:", req.user);
    console.log("Status filter:", status);

    // First, try to get products directly by createdBy
    const directProducts = await Product.find({ createdBy: userId });
    console.log("Direct products by createdBy:", directProducts.length);
    console.log(
      "Direct product IDs:",
      directProducts.map((p) => p._id)
    );

    // Get user with populated listings
    const user = await User.findById(userId)
      .populate({
        path: "listings.productId",
        model: "Product",
      })
      .select("listings");

    console.log("User found:", user ? "Yes" : "No");
    console.log("User listings array:", user?.listings?.length || 0);

    if (user?.listings?.length > 0) {
      console.log("Listings details:");
      user.listings.forEach((item, index) => {
        console.log(
          `[${index}] ProductId: ${item.productId}, Status: ${item.status}`
        );
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter listings by status if provided
    let listings = user.listings || [];
    console.log("Listings before filter:", listings.length);

    if (status && status !== "all") {
      listings = listings.filter((item) => item.status === status);
      console.log("Listings after filter:", listings.length);
    }

    // Format the listings
    const formattedListings = listings.map((item) => ({
      _id: item.productId?._id,
      title: item.productId?.title,
      price: item.productId?.price,
      category: item.productId?.category,
      description: item.productId?.description,
      image: item.productId?.image,
      stock: item.productId?.stock,
      rating: item.productId?.rating,
      features: item.productId?.features || [],
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.productId?.updatedAt,
    }));

    console.log("Formatted listings count:", formattedListings.length);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedListings = formattedListings.slice(startIndex, endIndex);

    res.json({
      success: true,
      listings: paginatedListings,
      total: formattedListings.length,
      page: parseInt(page),
      totalPages: Math.ceil(formattedListings.length / limit),
      debug: {
        userId,
        directProductsCount: directProducts.length,
        userListingsCount: user.listings?.length || 0,
        formattedCount: formattedListings.length,
      },
    });
  } catch (error) {
    console.error("Get user listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
});
// Update a listing
listingRouter.put("/:productId", async (req, res) => {
  console.log("here we go");
  try {
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;
    const updates = req.body;

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Check if user owns the listing
    const user = await User.findOne({
      _id: userId,
      "listings.productId": productId,
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
      });
    }

    // Don't allow updating rating, createdBy, or changing the product owner
    const restrictedFields = ["rating", "createdBy", "_id"];
    for (const field of restrictedFields) {
      if (updates[field] !== undefined) {
        return res.status(400).json({
          success: false,
          message: `Cannot update ${field} field`,
        });
      }
    }

    // Validate price and stock if provided
    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (updates.stock !== undefined && updates.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $set: updates,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Listing updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update listing",
      error: error.message,
    });
  }
});

// Delete a listing
listingRouter.delete("/:productId", async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Check if the product exists and get owner info
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user owns the listing
    const isOwner = product.createdBy.toString() === userId.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this listing",
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    // Remove from user's listings
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          listings: { productId: productId },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete listing",
      error: error.message,
    });
  }
});
// Get single listing (with authorization check)
listingRouter.get("/listing/:productId", async (req, res) => {
  console.log("get listing");
  try {
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check if user owns the listing or is admin
    const user = await User.findOne({
      _id: userId,
      "listings.productId": productId,
    });

    if (!user && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this listing",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
      error: error.message,
    });
  }
});

// Update listing status
listingRouter.patch("/:productId/status", async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "sold", "pending"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Check if user owns the listing
    const user = await User.findOne({
      _id: userId,
      "listings.productId": productId,
    });

    if (!user && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
      });
    }

    // Update the listing status in user's listings array
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "listings.productId": productId,
      },
      {
        $set: { "listings.$.status": status },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Listing not found in your listings",
      });
    }

    res.json({
      success: true,
      message: `Listing status updated to ${status}`,
      status,
    });
  } catch (error) {
    console.error("Update listing status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update listing status",
      error: error.message,
    });
  }
});

// Admin: Get all listings (with filtering)
listingRouter.get("/admin/all", async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "name email"),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
});

// ============================================
// MOUNT LISTING ROUTES
// ============================================

// Mount listing routes under /listings path
router.use("/listings", listingRouter);

// ============================================
// PUBLIC PARAMETER ROUTES (must come after all specific routes)
// ============================================

// Get single product (public) - This should be LAST
router.get("/:id", async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ============================================
// ADMIN ROUTES (Admin only - for sample data)
// ============================================

// Initialize sample products (Admin only)
router.post("/init-products", async (req, res) => {
  try {
    // You might want to add admin check here
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const sampleProducts = [
      {
        title: "iPhone 14 Pro Max",
        price: 1099.99,
        category: "electronics",
        description: "Latest Apple smartphone with advanced camera system",
        image: "https://picsum.photos/400/400?random=1",
        rating: { rate: 4.8, count: 150 },
        stock: 45,
        features: ["5G", "Face ID", "Pro Camera"],
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        title: "MacBook Pro 16-inch",
        price: 2399.99,
        category: "electronics",
        description: "Professional laptop for creative work",
        image: "https://picsum.photos/400/400?random=2",
        rating: { rate: 4.9, count: 89 },
        stock: 23,
        features: ["M2 Chip", "Retina Display", "Touch Bar"],
        createdBy: new mongoose.Types.ObjectId(),
      },
    ];

    // Clear existing products first
    await Product.deleteMany({});

    // Insert new products
    const products = await Product.insertMany(sampleProducts);

    res.status(201).json({
      success: true,
      message: `${products.length} products initialized successfully`,
      count: products.length,
      products: products.map((product) => ({
        id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating,
        stock: product.stock,
      })),
    });
  } catch (error) {
    console.error("Init products error:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing products",
      error: error.message,
    });
  }
});

module.exports = router;
