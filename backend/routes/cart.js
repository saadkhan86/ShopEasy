const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All cart routes are protected
router.use(authenticateToken);

// Add to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = req.user;

    // Check if product already in cart
    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      // Update quantity if already in cart
      existingCartItem.quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        productId,
        quantity,
      });
    }

    await user.save();
    await user.populate("cart.productId");

    res.json({
      success: true,
      message: "Product added to cart",
      cart: user.cart,
    });
  } catch (error) {
    // console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get cart
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.productId");
    res.json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    // console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update cart item quantity
router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const user = req.user;
    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cartItem.quantity = quantity;
    await user.save();
    await user.populate("cart.productId");

    res.json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    // console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Remove from cart
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const user = req.user;
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();
    await user.populate("cart.productId");

    res.json({
      success: true,
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    // console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  try {
    const user = req.user;
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: "Cart cleared",
      cart: [],
    });
  } catch (error) {
    // console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
