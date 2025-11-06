const express = require("express");
const router = express.Router();
const Timesheet = require("../models/Timesheet");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, '123456', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded; // decoded contains userId
        next();
    });
};
const authorizeRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: "Not authorized" });
    }
    next();
};

const authorizeType = (type) => (req, res, next) => {
    if (!req.user || req.user.type !== type) {
        return res.status(403).json({ message: "Not authorized" });
    }
    next();
};

// 🟢 Coach Check-In
router.post("/checkin", auth, authorizeRole("Coach"), async (req, res) => {
    console.log('got loc= ', req.body)
    try {
        const { longitude, latitude } = req.body;

        // Ensure the coach is not already checked in
        const activeSession = await Timesheet.findOne({ user: req.user._id, checkOut: null });
        if (activeSession) {
            return res.status(400).json({ message: "You already checked in." });
        }

        const entry = await Timesheet.create({
            user: req.user._id,
            location: {
                longitude,
                latitude
            },
            checkIn: new Date()
        });

        res.status(201).json({ message: "Checked in successfully.", entry });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

// 🔴 Coach Check-Out
router.post("/checkout", auth, authorizeRole("Coach"), async (req, res) => {
    try {
        const activeSession = await Timesheet.findOne({ user: req.user._id, checkOut: null });

        if (!activeSession) {
            return res.status(400).json({ message: "No active check-in found." });
        }

        activeSession.checkOut = new Date();
        await activeSession.save();

        res.status(200).json({ message: "Checked out successfully.", entry: activeSession });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

// 🟣 Club View Coach Timesheet
router.get("/:coachId", auth, authorizeType("Club"), async (req, res) => {
    const { coachId } = req.params;

    try {
        const records = await Timesheet.find({ user: coachId })
            .sort({ checkIn: -1 });

        res.status(200).json(records);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

module.exports = router;
