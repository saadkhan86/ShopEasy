const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const otpRoutes = require("./routes/otp");
const passwordRoutes = require("./routes/password"); // Add this line
const Product = require("./models/Product");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/password", passwordRoutes); // Make sure this line exists

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ecommerce Backend API is running!",
  });
});

app.get("/delete/products/all", async (req, res) => {
  const del = await Product.deleteMany({});
  res.send(del);
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route is working!",
  });
});

// 404 handler - Catch all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}`);
      console.log(`🔑 Auth routes: http://localhost:${PORT}/api/auth`);
      console.log(`🛍️ Product routes: http://localhost:${PORT}/api/products`);
      console.log(`🛒 Cart routes: http://localhost:${PORT}/api/cart`);
      console.log(`📧 OTP routes: http://localhost:${PORT}/api/otp`);
      console.log(`🔐 Password routes: http://localhost:${PORT}/api/password`); // Add this line
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
