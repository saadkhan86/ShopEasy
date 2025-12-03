const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth"); // Import authenticateToken
const router = express.Router();
// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Email configuration (replace with your email credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sk8613013@gmail.com", // Your email
    pass: "uvscnxjyecsbtfqc", // Your app password
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: "ShopEasy",
    to: email,
    subject: "Email Verification OTP - ShopEasy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">ShopEasy Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="background: #f4f4f4; padding: 15px; text-align: center; letter-spacing: 5px; font-size: 32px;">
          ${otp}
        </h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666;">ShopEasy Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Step 1: Signup - Send OTP
router.post("/signup", async (req, res) => {
  // console.log(req.body);
  try {
    const { name, email, password, country, contact } = req.body;

    // Validation
    if (!name || !email || !password || !country || !contact) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    // console.log(otp);
    otpStore.set(email, {
      otp,
      name,
      password,
      country,
      contact,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    try {
      await sendOTPEmail(email, otp);
      res.json({
        success: true,
        message:
          "OTP sent to your email. Please verify to complete registration.",
        email: email,
      });
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Step 2: Verify OTP and Complete Registration
router.post("/:mail/verifyotp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified - Create user
    const hashedPassword = await bcrypt.hash(otpData.password, 12);

    const newUser = new User({
      name: otpData.name,
      email: email,
      password: hashedPassword,
      country: otpData.country,
      contact: otpData.contact,
      cart: [],
      emailVerified: true,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Clean up OTP
    otpStore.delete(email);

    res.status(201).json({
      success: true,
      message: "Email verified and account created successfully!",
      user: newUser,
      token,
    });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Resend OTP
router.post("/:mail/resendotp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "No pending registration found for this email",
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    otpStore.set(email, {
      ...otpData,
      otp: newOTP,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(email, newOTP);

    res.json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
});

// Login Route (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exists",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// ... (your existing OTP and signup code remains the same until profile routes)

// ========== PROFILE ROUTES ==========

// Get user profile (protected route) - ADD authenticateToken middleware
router.post("/profile", authenticateToken, async (req, res) => {
  try {
    // User is already attached by authenticateToken middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact || "",
      country: user.country || "",
      profilePicture: user.profilePicture || "",
      emailVerified: user.emailVerified || false,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      createdAt: user.createdAt,
    };
    res.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user profile - ADD authenticateToken middleware
router.patch("/profile", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = req.user; // User from middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Update only allowed fields
    const allowedUpdates = ["name","country", "contact"];
    const updatesToApply = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updatesToApply[field] = updates[field];
      }
    });

    // Don't allow email changes through this route
    if (updates.email && updates.email !== user.email) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be changed through this route",
      });
    }

    // Apply updates
    Object.keys(updatesToApply).forEach((key) => {
      user[key] = updatesToApply[key];
    });

    await user.save();

    // Create response object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact || "",
      country: user.country || "",
      profilePicture: user.profilePicture || "",
      emailVerified: user.emailVerified || false,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
