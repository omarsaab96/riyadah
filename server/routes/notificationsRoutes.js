const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require("jsonwebtoken");
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const expo = new Expo();

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

// Get notifications by userID
router.get('/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
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

// Mark notification as read
router.patch('/mark-read/:notificationId', authenticateToken, async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or access denied' });
        }

        res.json({ success: true, notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});


module.exports = router;
