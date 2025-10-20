const express = require('express');
const router = express.Router();
const MonthlySurvey = require('../models/monthlySurvey');

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

//create monthly survey
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      injuries,
      injuryDetails,
      coachTrainingSatisfaction,
      areaOfImprovement,
      satisfaction,
      performance,
      recovery,
      sleep,
      mentally,
      notes,
    } = req.body;
    const userId = req.user.userId;

    const newSurvey = new MonthlySurvey({
      user: userId,
      injuries,
      injuryDetails,
      coachTrainingSatisfaction,
      areaOfImprovement,
      satisfaction,
      performance,
      recovery,
      sleep,
      mentally,
      notes,
    });
    await newSurvey.save();
    res.status(201).json({ message: 'Monthly survey created successfully', survey: newSurvey });
  } catch (error) {
    console.error('Error creating monthly survey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;