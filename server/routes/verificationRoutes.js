const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const { generateOTP, generateVerificationToken, verifyOTP } = require('../utils/otpService.js');
const { sendEmail } = require('../utils/emailService.js');

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, '123456', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded; // decoded contains userId
    next();
  });
};

router.get("/test-smtp", async (req, res) => {
  try {
    // for demo, get email + otp from query
    const newEmail = req.query.email;
    const otp = Math.floor(100000 + Math.random() * 900000);

    if (!newEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // send test email
    await sendEmail(
      newEmail,
      "Verify your email",
      `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h3 style="color:#007bff;">${otp}</h3>
        <p>This code expires in <strong>10 minutes</strong>.</p>
      </div>
    `
    );

    res.json({ success: true, message: "Test email sent successfully!" });
  } catch (err) {
    console.error("SMTP error:", err);
    res.status(500).json({
      success: false,
      message: "SMTP test failed",
      error: err.message,
    });
  }
});

router.post("/:id/otp", async (req, res) => {
  const { otp, verificationToken } = req.body;

  try {
    if (!verifyOTP(otp, verificationToken)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // ✅ OTP valid → mark email as verified
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure verified object exists
    if (!user.verified) user.verified = { email: null, phone: null };
    user.verified.email = Date.now();

    await user.save();

    res.json({ result: "success", message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Failed to verify email", details: err.message });
  }
});

router.post("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { type, newEmail, oldEmail } = req.body;

  if (type == "email") {
    try {


      if (oldEmail != newEmail) {
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.email = newEmail;

        if (user.verified != null && user.verified.email != null) {
          user.verified.email = null;
        }

        await user.save();

      }

      const otp = generateOTP();
      const { token } = generateVerificationToken(otp);

      // send test email
      const emailSent = await sendEmail(
        newEmail,
        "Verify your email",
        `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h3 style="color:#007bff;">${otp}</h3>
        <p>This code expires in <strong>10 minutes</strong>.</p>
      </div>
      `
      );

      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Failed to send OTP email" });
      }

      // send hashed token to frontend
      res.json({
        result: "success",
        verificationToken: token,
        message: "OTP sent to email",
      });
    } catch (err) {
      console.error("Email update error:", err);
      res.status(500).json({ success: false, message: "Failed to update email", error: err.message });
    }
  }

  if (type == "phone") {
    //send wtp
  }
});



module.exports = router;
