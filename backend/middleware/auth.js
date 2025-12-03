const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

const authenticateToken = async (req, res, next) => {
  try {
    // console.log("🔐 Auth Middleware - Request to:", req.originalUrl);

    const authHeader = req.headers["authorization"];
    // console.log("🔐 Auth Header:", authHeader);

    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      // console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("🔐 Decoded Token:", decoded);

    const user = await User.findById(decoded.userId);

    if (!user) {
      // console.log("❌ User not found");
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    // console.log("✅ User authenticated:", user);
    next();
  } catch (error) {
    // console.log("❌ Token error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticateToken, JWT_SECRET };
