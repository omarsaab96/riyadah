const express = require('express');
const router = express.Router();
const PostSessionSurvey = require('../models/postSessionSurvey');

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

//create post session survey
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { intensity, physicalFeeling, discomfortDetails, focusLevel, discomfort, notes } = req.body;
    const userId = req.user.userId;

    const newSurvey = new PostSessionSurvey({
      user: userId,
      intensity,
      physicalFeeling,
      focusLevel,
      discomfort,
      discomfortDetails,
      notes
    });
    await newSurvey.save();
    res.status(201).json({ message: 'Post session survey created successfully', survey: newSurvey });
  } catch (error) {
    console.error('Error creating post session survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;