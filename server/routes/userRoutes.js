const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create user
router.post('/', async (req, res) => {
  try {
    console.log('Incoming body:', req.body);
    const newUser = await User.create(req.body);
    res.status(200).json(req.body);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  // res.status(200).json({ status: 'success' });
});

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
