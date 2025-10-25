
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const jwt = require("jsonwebtoken");


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

router.get('/user', authenticateToken, async (req, res) => {
  console.log(req.user.userId)
  try {
    const payments = await Payment.find({
      $or: [
        { payer: req.user.userId },
        { beneficiary: req.user.userId }
      ]
    })
      .populate('payer', '_id name email image')
      .populate('beneficiary', '_id name email image');

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email image gender')  // Optional: Populate user info
      .populate('club', 'name email sport');       // Optional: Populate club info

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { payer, beneficiary, type, amount, currency, note,status } = req.body;

    //check if balance of payer has sufficient funds
    const wallet = await Wallet.findOne({ user: payer });
    
    if (!wallet || wallet.availableBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }else{
      //deduct amount from payer wallet
      wallet.availableBalance -= amount;
      await wallet.save();
    }

    const payment = await Payment.create({
      payer,
      beneficiary,
      amount,
      currency,
      type,
      note,
      status
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paid: true, paidDate: new Date() },
      { new: true }
    );

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


module.exports = router;
