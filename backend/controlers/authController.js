const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Signup - Send OTP
exports.signup = async (req, res) => {
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

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
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

    // Store user data with OTP
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
      // console.error("OTP email error:", emailError);
      otpStore.delete(email); // Clean up on error

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    // console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Step 2: Verify OTP and Complete Registration
exports.verifyOTP = async (req, res) => {
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

    // Send welcome email
    try {
      await sendWelcomeEmail(email, otpData.name);
    } catch (welcomeEmailError) {
      // console.error("Welcome email error:", welcomeEmailError);
      // Don't fail registration if welcome email fails
    }

    res.status(201).json({
      success: true,
      message: "Email verified and account created successfully!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        country: newUser.country,
        contact: newUser.contact,
        emailVerified: newUser.emailVerified,
      },
      token,
    });
  } catch (error) {
    // console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
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

    // Check if we can resend (prevent spam)
    const lastResend = otpData.lastResend || 0;
    const now = Date.now();
    if (now - lastResend < 60000) {
      // 1 minute cooldown
      return res.status(429).json({
        success: false,
        message: "Please wait 1 minute before requesting another OTP",
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    otpStore.set(email, {
      ...otpData,
      otp: newOTP,
      lastResend: now,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendOTPEmail(email, newOTP);

      res.json({
        success: true,
        message: "New OTP sent to your email",
      });
    } catch (emailError) {
      // console.error("Resend OTP email error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP email",
      });
    }
  } catch (error) {
    // console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// Login Route
exports.login = async (req, res) => {
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
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message:
          "Account is locked. Please try again later or reset your password.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        contact: user.contact,
        emailVerified: user.emailVerified,
        cart: user.cart,
      },
      token,
    });
  } catch (error) {
    // console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -passwordHistory"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    // console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Don't allow email/password updates through this route
    if (updates.email || updates.password) {
      return res.status(400).json({
        success: false,
        message: "Email and password cannot be updated through this route",
      });
    }

    // Allowed fields to update
    const allowedUpdates = ["name", "country", "contact", "profilePicture"];
    const updateData = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -passwordHistory");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    // console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check email availability
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    res.json({
      success: true,
      available: !user,
      message: user ? "Email already registered" : "Email available",
    });
  } catch (error) {
    // console.error("Check email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check email availability",
    });
  }
};

// Change password (requires old password)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Check password history (prevent reuse)
    if (user.passwordHistory) {
      for (const oldPassword of user.passwordHistory) {
        const isOldPassword = await bcrypt.compare(
          newPassword,
          oldPassword.password
        );
        if (isOldPassword) {
          return res.status(400).json({
            success: false,
            message: "New password cannot be one of your previous passwords",
          });
        }
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password history
    const passwordHistory = user.passwordHistory || [];
    passwordHistory.push({
      password: user.password,
      changedAt: Date.now(),
    });

    // Keep only last 5 passwords
    if (passwordHistory.length > 5) {
      passwordHistory.shift();
    }

    // Update user
    user.password = hashedPassword;
    user.passwordHistory = passwordHistory;
    user.passwordChangedAt = Date.now();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    // console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
