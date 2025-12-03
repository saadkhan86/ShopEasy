const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Optional: Add connection timeout
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
});

// Common HTML template wrapper
const getEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
          background: linear-gradient(135deg, #1DB954, #17a850);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        
        .email-header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        
        .email-header p {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 5px;
        }
        
        .email-content {
          padding: 30px;
        }
        
        .email-footer {
          background: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        
        .email-footer a {
          color: #1DB954;
          text-decoration: none;
        }
        
        .button {
          display: inline-block;
          background: #1DB954;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 15px 0;
          transition: background-color 0.3s ease;
        }
        
        .button:hover {
          background: #17a850;
        }
        
        .otp-display {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          border: 2px dashed #ddd;
        }
        
        .otp-code {
          font-size: 32px;
          font-weight: 700;
          color: #1DB954;
          letter-spacing: 5px;
          font-family: 'Courier New', monospace;
        }
        
        .expiry-note {
          color: #ff6b6b;
          font-size: 14px;
          margin-top: 10px;
        }
        
        .reset-link {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #1DB954;
          word-break: break-all;
        }
        
        .reset-link a {
          color: #1DB954;
          text-decoration: none;
          font-weight: 600;
        }
        
        @media (max-width: 600px) {
          .email-content {
            padding: 20px;
          }
          
          .otp-code {
            font-size: 28px;
            letter-spacing: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>ShopEasy</h1>
          <p>Your Ultimate Shopping Destination</p>
        </div>
        
        <div class="email-content">
          ${content}
        </div>
        
        <div class="email-footer">
          <p>&copy; ${new Date().getFullYear()} ShopEasy. All rights reserved.</p>
          <p>This email was sent by ShopEasy. Please do not reply to this email.</p>
          <p><a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/unsubscribe">Unsubscribe</a> | 
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/privacy">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 15px;">Email Verification Required</h2>
    <p>Thank you for signing up with ShopEasy! To complete your registration, please verify your email address using the OTP below:</p>
    
    <div class="otp-display">
      <div class="otp-code">${otp}</div>
      <p class="expiry-note">⚠️ This OTP will expire in 10 minutes</p>
    </div>
    
    <p>Enter this code on the verification page to activate your account.</p>
    <p>If you didn't create a ShopEasy account, please ignore this email.</p>
    
    <p style="margin-top: 25px; color: #666; font-size: 14px;">
      <strong>Security Tip:</strong> Never share your OTP with anyone. ShopEasy will never ask for your OTP via phone or email.
    </p>
  `;

  const mailOptions = {
    from: `ShopEasy <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - ShopEasy",
    html: getEmailTemplate(content, "Email Verification"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error("Failed to send OTP email");
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, resetUrl) => {
  // console.log(resetUrl);
  const content = `
    <h2 style="color: #333; margin-bottom: 15px;">Password Reset Request</h2>
    <p>You recently requested to reset your password for your ShopEasy account. Click the button below to reset it:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" class="button">Reset Your Password</a>
    </div>
    
    <div class="reset-link">
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
    
    <p class="expiry-note">⚠️ This password reset link will expire in 30 minutes</p>
    
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    
    <p style="margin-top: 25px; color: #666; font-size: 14px;">
      <strong>Security Alert:</strong> If you didn't request this password reset, please contact our support team immediately.
    </p>
  `;

  const mailOptions = {
    from: `ShopEasy <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - ShopEasy",
    html: getEmailTemplate(content, "Password Reset"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error("Failed to send password reset email");
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 15px;">Welcome to ShopEasy, ${name}! 🎉</h2>
    <p>Your account has been successfully created and verified. We're excited to have you onboard!</p>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1DB954; margin-bottom: 10px;">Getting Started:</h3>
      <ul style="padding-left: 20px;">
        <li>Browse thousands of products</li>
        <li>Add items to your wishlist</li>
        <li>Complete your profile for personalized recommendations</li>
        <li>Check out our daily deals and discounts</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/home" class="button">Start Shopping Now</a>
    </div>
    
    <p>If you have any questions or need assistance, our support team is here to help.</p>
    
    <p style="margin-top: 25px; color: #666; font-size: 14px;">
      Happy Shopping!<br>
      The ShopEasy Team
    </p>
  `;

  const mailOptions = {
    from: `ShopEasy <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to ShopEasy!",
    html: getEmailTemplate(content, "Welcome to ShopEasy"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error("Failed to send welcome email");
  }
};

// Send Account Security Alert
const sendSecurityAlertEmail = async (email, deviceInfo = {}) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 15px;">Security Alert 🔒</h2>
    <p>We detected a new login to your ShopEasy account.</p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0;">
      <p><strong>Login Details:</strong></p>
      <p>Time: ${new Date().toLocaleString()}</p>
      ${deviceInfo.browser ? `<p>Browser: ${deviceInfo.browser}</p>` : ""}
      ${deviceInfo.os ? `<p>Operating System: ${deviceInfo.os}</p>` : ""}
      ${deviceInfo.ip ? `<p>IP Address: ${deviceInfo.ip}</p>` : ""}
    </div>
    
    <p>If this was you, you can safely ignore this email.</p>
    
    <p style="color: #ff6b6b; font-weight: 600;">If this wasn't you:</p>
    <ul style="padding-left: 20px; margin: 10px 0;">
      <li>Immediately change your password</li>
      <li>Enable two-factor authentication</li>
      <li>Contact our support team</li>
    </ul>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset" class="button" style="background: #dc3545;">Reset Password</a>
    </div>
    
    <p style="margin-top: 25px; color: #666; font-size: 14px;">
      Stay safe,<br>
      The ShopEasy Security Team
    </p>
  `;

  const mailOptions = {
    from: `ShopEasy Security <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Security Alert: New Login Detected - ShopEasy",
    html: getEmailTemplate(content, "Security Alert"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error("Failed to send security alert email");
  }
};

// Send Order Confirmation Email (if needed later)
const sendOrderConfirmationEmail = async (email, orderDetails) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 15px;">Order Confirmation 📦</h2>
    <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1DB954; margin-bottom: 10px;">Order Summary:</h3>
      <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
      <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
      <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
      <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/orders/${
    orderDetails.orderId
  }" class="button">Track Your Order</a>
    </div>
    
    <p>You will receive another email when your order ships.</p>
    
    <p style="margin-top: 25px; color: #666; font-size: 14px;">
      Thank you for shopping with us!<br>
      The ShopEasy Team
    </p>
  `;

  const mailOptions = {
    from: `ShopEasy Orders <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation #${orderDetails.orderId} - ShopEasy`,
    html: getEmailTemplate(content, "Order Confirmation"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error("Failed to send order confirmation email");
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSecurityAlertEmail,
  sendOrderConfirmationEmail,
  transporter, // Export transporter for direct use if needed
};
