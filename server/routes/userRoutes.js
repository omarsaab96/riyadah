const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, "123456");

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    console.log('Incoming body:', req.body);
    const newUser = await User.create(req.body);

    const token = jwt.sign({ userId: newUser._id }, "123456");

    res.status(201).json({ newUser, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// find children by parent email
router.get('/find-children', async (req, res) => {
    try {
        const { parentEmail } = req.query;
        const children = await User.find(
          {
            type: 'Athlete',
            parentEmail
          }
        ).select('_id');

        res.json(children);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/check', async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ success: false, msg: 'Email or phone is required' });
  }

  try {
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(200).json({ success: false, msg: 'Email already exists' });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(200).json({ success: false, msg: 'Phone already exists' });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Check failed:', err);
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
});

router.post('/findAdmin', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, msg: 'Email is required' });
  }

  try {
    if (email) {
      const existingEmail = await User.findOne({ email });

      if (!existingEmail) {
        return res.status(404).json({ success: false, msg: 'Admin not found' });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Check failed:', err);
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Search athletes by name (case-insensitive, partial match)
router.get('/search', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  try {
    const regex = new RegExp(name, 'i');
    const athletes = await User.find({
      type: 'Athlete',
      name: { $regex: regex }
    }).select('_id'); 

    res.json(athletes);
  } catch (err) {
    console.error('Error searching athletes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Edit user
router.put('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  // Optional: Ensure the token's userId matches the request param
  if (req.user.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized access to update user data' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body }, // Update only fields provided in req.body
      { new: true, runValidators: true }
    ).select('-password'); // Don't return the password

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get user info
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  // Optional: Make sure the token's userId matches the request param
  // if (req.user.userId !== userId) {
  //   return res.status(403).json({ error: 'Unauthorized access to user data' });
  // }

  try {
    const user = await User.findById(userId).select('-password'); // don't return password

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
