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

// 🟢 Coach Check-In
router.post("/checkin", auth, async (req, res) => {
    try {
        const { longitude, latitude, role } = req.body;

        if (role != "Coach") {
            return res.status(403).json({ message: "Wrong role." });
        }

        // Ensure the coach is not already checked in
        const activeSession = await Timesheet.findOne({ user: req.user.userId, checkOut: null });
        if (activeSession) {
            return res.status(400).json({ message: "You already checked in." });
        }

        const entry = await Timesheet.create({
            user: req.user.userId,
            location: {
                longitude,
                latitude,
            },
            checkIn: new Date()
        });

        res.status(201).json({ message: "Checked in successfully.", entry });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

// 🔴 Coach Check-Out
router.post("/checkout", auth, async (req, res) => {
    try {
        const { longitude, latitude, role } = req.body;

        const activeSession = await Timesheet.findOne({ user: req.user.userId, checkOut: null });

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

// 🟣 Get user Timesheet
router.get("/:userId", auth, async (req, res) => {
    const { userId } = req.params;

    try {
        const records = await Timesheet.find({ user: userId })
            .sort({ checkIn: -1 });

        res.status(200).json(records);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

router.get('/club/:id', async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
            .populate('teams')
            .populate('userRef');

        if (!staff) {
            return res
                .status(404)
                .json({ success: false, message: 'Staff not found' });
        }

        const records = await Timesheet.find({ user: staff.userRef._id })
            .sort({ checkIn: -1 });

        res.status(200).json(records);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
