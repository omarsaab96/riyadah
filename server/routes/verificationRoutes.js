const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",  // 👈 Hostinger SMTP
  port: 465,                   // 465 for SSL
  secure: true,                // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // e.g. noreply@yourdomain.com
    pass: process.env.EMAIL_PASS, // password you set for this email
  },
});


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
    // test connection
    await transporter.verify();

    // for demo, get email + otp from query
    const newEmail = req.query.email;
    const otp = req.query.otp || Math.floor(100000 + Math.random() * 900000);

    if (!newEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // send test email
    await transporter.sendMail({
      from: `"Riyadah App" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: "Verify your new email",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h3 style="color:#007bff;">${otp}</h3>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn’t request this, ignore this email.</p>
          <br>
          <p>— Riyadah Team</p>
        </div>
      `,
    });

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


router.post("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { type, newEmail, oldEmail } = req.body;

  if (type == "email") {
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

    // send OTP via email
    await transporter.sendMail({
      from: `"Riyadah App" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: "Verify your new email",
      html: `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h3 style="color:#007bff;">${otp}</h3>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn’t request this, ignore this email.</p>
      <br>
      <p>— Riyadah Team</p>
    </div>
  `,
    });


    // send hashed token to frontend
    res.json({
      result: "success",
      verificationToken: token,
      message: "OTP sent to email",
    });
  }
});

router.post("/:id/otp", async (req, res) => {
  const { otp, verificationToken } = req.body;

  if (!verifyOTP(otp, verificationToken)) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // ✅ OTP valid → mark email as verified
  await User.findByIdAndUpdate(req.params.id, { isEmailVerified: true });

  res.json({ result: "success", message: "Email verified successfully" });
});



module.exports = router;
