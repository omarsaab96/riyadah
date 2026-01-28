const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require("jsonwebtoken");
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const Team = require('../models/Team');
const Schedule = require('../models/Schedule');
const { sendNotification } = require('../utils/notificationService');
const { buildNotificationContent, NOTIFICATION_TEMPLATES } = require('../utils/notificationTemplates');
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

const requireManager = async (req, res, next) => {
    try {
        const user = await User.findById(req.user?.userId).select('type').lean();
        if (!user || (user.type !== 'Manager' && user.type !== 'superadmin')) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        next();
    } catch (err) {
        console.error('Manager auth error:', err);
        res.status(500).json({ error: 'Authorization failed' });
    }
};

const uniqueIds = (ids = []) => Array.from(new Set(ids.map(id => String(id))));

const getTeamMemberIds = async (teamId) => {
    const team = await Team.findById(teamId).select('members coaches').lean();
    if (!team) return [];
    return uniqueIds([...(team.members || []), ...(team.coaches || [])]);
};

const getCoachAthleteIds = async (coachId) => {
    const teams = await Team.find({ coaches: coachId }).select('members').lean();
    const memberIds = [];
    teams.forEach(team => {
        (team.members || []).forEach(memberId => memberIds.push(memberId));
    });
    return uniqueIds(memberIds);
};

const getClubAthleteIds = async (clubId) => {
    const teams = await Team.find({ club: clubId }).select('_id members').lean();
    const teamIds = teams.map(team => team._id);
    const memberIds = [];
    teams.forEach(team => {
        (team.members || []).forEach(memberId => memberIds.push(memberId));
    });

    const users = await User.find({
        type: 'Athlete',
        $or: [
            { clubs: clubId },
            { memberOf: { $in: teamIds } },
            { _id: { $in: memberIds } }
        ]
    }).select('_id').lean();

    return uniqueIds(users.map(user => user._id));
};

const getEventParticipantIds = async (eventId) => {
    const event = await Schedule.findById(eventId).populate('team').lean();
    if (!event) return [];

    let userIds = [];
    if (event.team) {
        const team = await Team.findById(event.team._id || event.team).select('members coaches').lean();
        if (team) userIds = [...(team.members || []), ...(team.coaches || [])];
    }

    if (event.coaches?.length) userIds.push(...event.coaches);
    if (event.participants?.length) {
        userIds.push(...event.participants.map((p) => p.user));
    }

    return uniqueIds(userIds);
};

// Get notifications by userID
router.get('/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    try {
        const notifications = await Notification.find({
            userId,
            linked: true
        });
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

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await Notification.updateMany(
            { userId, read: false }, // only unread ones
            { read: true }
        );

        const linkedNotifications = await Notification.find({
            userId,
            linked: true
        });

        res.json({
            success: true,
            notifications: linkedNotifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

//Delete notification
router.patch('/delete/:notificationId', authenticateToken, async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { linked: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true, notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to unlink notification' });
    }
});

// Manual notification sender (Manager only)
router.post('/manual', authenticateToken, requireManager, async (req, res) => {
    try {
        const { target = {}, notification = {} } = req.body || {};
        const { mode } = target;
        let recipientIds = [];

        if (mode === 'user' && target.userId) {
            recipientIds = [target.userId];
        } else if (mode === 'users' && Array.isArray(target.userIds)) {
            recipientIds = target.userIds;
        } else if (mode === 'club' && target.clubId) {
            recipientIds = await getClubAthleteIds(target.clubId);
        } else if (mode === 'team' && target.teamId) {
            recipientIds = await getTeamMemberIds(target.teamId);
        } else if (mode === 'coach' && target.coachId) {
            recipientIds = await getCoachAthleteIds(target.coachId);
        } else if (mode === 'event' && target.eventId) {
            recipientIds = await getEventParticipantIds(target.eventId);
        } else if (mode === 'sport' && target.sport) {
            const users = await User.find({ sport: { $in: [target.sport] } })
                .select('_id')
                .lean();
            recipientIds = users.map(user => user._id);
        } else {
            return res.status(400).json({ error: 'Invalid target selection' });
        }

        recipientIds = uniqueIds(recipientIds);
        if (!recipientIds.length) {
            return res.status(200).json({ success: true, total: 0, sent: 0, failed: 0 });
        }

        const type = notification.type || 'info';
        const useRandom = Boolean(notification.random);
        const { title, body } = buildNotificationContent({
            type,
            title: notification.title,
            body: notification.body,
            random: useRandom,
        });

        const payload = {
            ...(notification.data || {}),
            type,
            manual: true,
        };

        const users = await User.find({
            _id: { $in: recipientIds },
            expoPushToken: { $exists: true, $ne: null },
        }).select('_id expoPushToken').lean();

        let sent = 0;
        let failed = 0;

        for (const user of users) {
            try {
                await sendNotification(user, title, body, payload, true);
                sent += 1;
            } catch (err) {
                console.error('Manual notification failed:', user._id, err.message);
                failed += 1;
            }
        }

        res.json({ success: true, total: users.length, sent, failed, type, template: NOTIFICATION_TEMPLATES[type] || null });
    } catch (err) {
        console.error('Manual notification error:', err);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});



module.exports = router;
