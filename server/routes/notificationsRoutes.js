const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
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

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Get notifications by userID
router.get('/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    // Optional: Make sure the token's userId matches the request param
    if (req.user.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    try {
        const notifications = await Notification.find({ userId });

        if (!notifications || notifications.length === 0) {
            return res.status(200).json([]);
        }

        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
