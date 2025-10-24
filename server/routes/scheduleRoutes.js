const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Team = require('../models/Team');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');


// Middleware: JWT Authentication
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, '123456');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
const Job = require('../models/Job');
const crypto = require('crypto');

// Middleware: Role-Based Authorization
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (req.user.type === 'Club') return next();
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        next();
    };
};

// Middleware: Team Membership Check
const checkTeamMembership = async (req, res, next) => {
    try {
        const teamId = req.params.teamId || req.body.team;
        if (!teamId) return next();

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const isAdmin = team.club.toString() === req.user._id.toString();
        const isCoach = team.coaches.some(c => c.toString() === req.user._id.toString());
        const isMember = team.members.some(m => m.toString() === req.user._id.toString());

        if (isAdmin || isCoach || isMember) {
            req.team = team;
            return next();
        }

        res.status(403).json({
            success: false,
            message: 'Not a team member'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Middleware: Event Ownership Check
const checkEventOwnership = async (req, res, next) => {
    try {
        const event = await Schedule.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const isAdmin = event.club.toString() === req.user._id.toString();
        const isCreator = event.createdBy.toString() === req.user._id.toString();
        const isCoach = event.coaches.some(c => c.toString() === req.user._id.toString());

        if (isAdmin || isCreator || isCoach) {
            req.event = event;
            return next();
        }

        res.status(403).json({
            success: false,
            message: 'Not authorized to modify this event'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Middleware: Request Validation
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        res.status(400).json({
            success: false,
            errors: errors.array()
        });
    };
};

// @route   GET /api/schedules
// @desc    Get all events for a club with filters (private access)
router.get('/', authenticate, async (req, res) => {
    try {
        const { team, date, startTime, endTime, eventType } = req.query;
        const filters = {
            club: req.user._id,
            // status: { $ne: 'cancelled' }
        };

        if (team) filters.team = team;
        if (eventType) filters.eventType = eventType;
        if (date && startTime && endTime) {
            filters.date = { $eq: new Date(date) };
            filters.startTime = { $gte: new Date(startTime) };
            filters.endTime = { $lte: new Date(endTime) };
        }

        const events = await Schedule.find(filters)
            .populate('team', 'name sport ageGroup')
            .populate('participants.user', 'name image')
            .populate('coaches', 'name image')
            .sort({ startDateTime: 1 });

        res.json({ success: true, data: events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/schedules/user/:userId
// @desc    Get all events for a specific user (based on their team membership)
// @access  Private (Athletes, Coaches, Club admins)
router.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // 1️⃣ Get user and verify existence
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2️⃣ Get all teams that include this user
        // This checks if the user is a member, coach, or club owner of the team
        const teams = await Team.find({
            $or: [
                { members: user._id },
                { coaches: user._id },
                { club: user._id }
            ]
        }).select('_id name sport ageGroup');

        if (!teams.length) {
            return res.status(200).json({ success: true, data: [] });
        }

        const teamIds = teams.map(t => t._id);

        // 3️⃣ Fetch all events that belong to these teams
        const events = await Schedule.find({
            team: { $in: teamIds },
            status: { $ne: 'cancelled' }
        })
            .populate('team', 'name sport ageGroup')
            .populate('participants.user', 'name image')
            .populate('coaches', 'name image')
            .sort({ startDateTime: 1 });

        res.status(200).json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/schedules/club/:clubId
// @desc    Get all events for a specific club (public access)
router.get('/club/:clubId', async (req, res) => {
    try {
        const { team, date, startTime, endTime, eventType } = req.query;
        const filters = {
            club: req.params.clubId,
            status: { $ne: 'cancelled' }
        };

        if (team) filters.team = team;
        if (eventType) filters.eventType = eventType;
        if (date && startTime && endTime) {
            filters.date = { $eq: new Date(date) };
            filters.startTime = { $gte: new Date(startTime) };
            filters.endTime = { $lte: new Date(endTime) };
        }

        const events = await Schedule.find(filters)
            .populate('team', 'name sport ageGroup')
            .populate('participants.user', 'name image')
            .populate('coaches', 'name image')
            .sort({ startDateTime: 1 });

        res.json({ success: true, data: events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/schedules
// @desc    Create a new event (with recurrence if applicable)
// @access  Private (Club admins/coaches)
router.post(
    '/',
    authenticate,
    authorize(['admin', 'coach']),
    checkTeamMembership,
    validate([
        check('title', 'Title is required').not().isEmpty(),
        check('date', 'Valid date required').isISO8601(),
        check('startTime', 'Valid start time required').isISO8601(),
        check('endTime', 'Valid end time required').isISO8601(),
        check('team', 'Team ID is required').isMongoId(),
        check('eventType', 'Invalid event type').isIn([
            'Training', 'Match', 'Meeting', 'Tournament', 'Other'
        ]),
        check('repeats', 'Invalid repeat value').isIn(['No', 'Daily', 'Weekly', 'Monthly'])
    ]),
    async (req, res) => {
        try {
            const { title, description, date, startTime, endTime, eventType, team, repeats, ...rest } = req.body;

            if (new Date(endTime) <= new Date(startTime)) {
                return res.status(400).json({ success: false, message: 'End time must be after start time' });
            }

            // Monthly guard: only allow day 1..27 (reject 28-31)
            if (repeats === 'Monthly') {
                const dayNum = new Date(date).getUTCDate(); // or local, but be consistent
                if (dayNum >= 28) {
                    return res.status(400).json({ success: false, message: 'Monthly recurrence cannot start on 28th–31st' });
                }
            }

            // Create a stable seriesId for idempotency
            const seriesId = repeats === 'No'
                ? undefined
                : `series_${crypto.randomBytes(8).toString('hex')}`;

            // Create the FIRST event only
            const first = new Schedule({
                title, description,
                date, startTime, endTime,
                eventType, team,
                club: req.user._id,
                createdBy: req.user._id,
                repeats,
                seriesId,
                occurrenceIndex: seriesId ? 0 : undefined,
                ...rest
            });
            await first.save();

            // Enqueue notifications for first occurrence
            await Job.create({
                type: 'notify',
                payload: {
                    eventId: first._id.toString(),
                    createdBy: req.user._id.toString()
                }
            });

            // If repeating, enqueue expansion (create the rest of the year)
            if (seriesId) {
                await Job.create({
                    type: 'expand-series',
                    payload: {
                        seriesId,
                        baseEventId: first._id.toString(),
                        repeats, // 'Daily' | 'Weekly' | 'Monthly'
                        // expand until exactly one year after base date
                        until: new Date(new Date(date).setFullYear(new Date(date).getFullYear() + 1)).toISOString()
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: repeats !== 'No'
                    ? `Event created; recurrence enqueued for expansion`
                    : 'Event created successfully',
                data: first
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
);


// @route   GET /api/schedules/:id
// @desc    get a specific event
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        const event = await Schedule.findById(eventId);

        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
);

// @route   PUT /api/schedules/:id
// @desc    Update an event or all recurring occurrences
// @access  Private (Club admins/coaches)
router.put('/:id',
    authenticate,
    authorize(['admin', 'coach']),
    checkEventOwnership,
    async (req, res) => {
        try {
            const { editScope } = req.body;
            const updates = { ...req.body };

            // 🧱 Prevent changing restricted fields
            delete updates._id;
            delete updates.club;
            delete updates.createdBy;
            delete updates.seriesId; // seriesId is fixed

            // 🧩 If event is completed, prevent edits
            if (req.event.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify completed events'
                });
            }

            // 🧠 CASE 1 — Update only this single event
            if (!editScope || editScope === 'single' || !req.event.seriesId) {
                Object.assign(req.event, updates);
                await req.event.save();

                const populatedEvent = await Schedule.findById(req.event._id)
                    .populate('team', 'name sport ageGroup')
                    .populate('participants.user', 'name image')
                    .populate('coaches', 'name image');

                return res.json({ success: true, data: populatedEvent });
            }

            // 🧠 CASE 2 — Update all events in this series
            if (editScope === 'all') {
                const seriesId = req.event.seriesId;

                // Allow time updates but keep each event’s date fixed
                const disallowedKeys = ['date', 'occurrenceIndex'];
                const safeUpdates = Object.keys(updates)
                    .filter(key => !disallowedKeys.includes(key))
                    .reduce((acc, key) => ({ ...acc, [key]: updates[key] }), {});

                const seriesEvents = await Schedule.find({ seriesId });
                // Update each event individually (preserve date, change time)
                for (const ev of seriesEvents) {
                    // preserve original date
                    const originalDate = ev.date;

                    // apply updates (like startTime, endTime, etc.)
                    Object.assign(ev, safeUpdates);

                    // reapply same date to ensure day doesn’t shift
                    ev.date = originalDate;

                    await ev.save();
                }

                return res.json({
                    success: true,
                    message: `Updated ${updated.modifiedCount} occurrences in this series (dates preserved).`,
                });
            }

            // Default fallback (shouldn’t hit here)
            return res.status(400).json({ success: false, message: 'Invalid edit scope' });

        } catch (err) {
            console.error('Error updating event:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);


// @route   DELETE /api/schedules/:id
// @desc    Cancel an event
// @access  Private (Club admins/coaches)
router.delete('/:id',
    authenticate,
    authorize(['admin', 'coach']),
    checkEventOwnership,
    async (req, res) => {
        try {
            req.event.status = 'cancelled';
            await req.event.save();
            res.json({ success: true, data: {} });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

// @route   POST /api/schedules/:id/rsvp
// @desc    RSVP to an event
// @access  Private (Team members)
router.post('/:id/rsvp',
    authenticate,
    checkTeamMembership,
    validate([
        check('status', 'Valid RSVP status required').isIn([
            'pending', 'confirmed', 'declined', 'tentative'
        ])
    ]),
    async (req, res) => {
        try {
            const { status } = req.body;
            const participantIndex = req.event.participants.findIndex(
                p => p.user.toString() === req.user._id.toString()
            );

            if (participantIndex >= 0) {
                req.event.participants[participantIndex].status = status;
                req.event.participants[participantIndex].responseDate = new Date();
            } else {
                req.event.participants.push({
                    user: req.user._id,
                    status,
                    responseDate: new Date()
                });
            }

            await req.event.save();
            res.json({ success: true, data: req.event.participants });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

// @route   GET /api/schedules/team/:teamId
// @desc    Get events for a specific team
// @access  Private (Team members)
router.get('/team/:teamId',
    authenticate,
    async (req, res) => {
        try {
            const { date, startTime, endTime } = req.query;
            const filters = {
                team: req.params.teamId,
                status: { $ne: 'cancelled' }
            };

            if (date && startTime && endTime) {
                filters.date = { $eq: new Date(date) };
                filters.startTime = { $gte: new Date(startTime) };
                filters.endTime = { $lte: new Date(endTime) };
            }

            const events = await Schedule.find(filters)
                .populate('team', 'name sport')
                .sort({ date: 1 });

            res.json({ success: true, data: events });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);


function formatDate(dateInput) {
    const date = new Date(dateInput);

    const pad = (num) => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

function formatTime(dateInput) {
    const date = new Date(dateInput);

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24h → 12h (and make 0 → 12)
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formatted = `${hours}:${minutes} ${ampm}`;
    return formatted;
}


module.exports = router;