const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Team = require('../models/Team');
const { check, validationResult } = require('express-validator');

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

const adminCheck = (req, res, next) => {
    // if (req.user.type !== 'Club' && req.user.role !== 'Admin') {
    if (req.user.type !== 'Club') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }
    next();
};

router.get('/', async (req, res) => {
    try {

        // Get staff with pagination and sorting
        const staff = await Staff.find()

        res.json({
            success: true,
            data: staff
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/staff/club/:clubId
 * @desc    Get all staff for a club with pagination and filtering
 * @access  Private (Club Admin/Staff)
 */
router.get('/club/:clubId', [
    auth,
    adminCheck,
], async (req, res) => {
    // Validate user has permission to view this club's staff
    if (req.user.type !== 'Club' || req.user._id.toString() !== req.params.clubId) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view staff for this club'
        });
    }

    try {
        // Parse query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { club: req.params.clubId };

        // Role filter
        if (req.query.role) {
            filter.role = { $in: req.query.role.split(',') };
        }

        // Active status filter
        if (req.query.isActive) {
            filter.isActive = req.query.isActive === 'true';
        }

        // Search filter
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Get total count for pagination
        const total = await Staff.countDocuments(filter);

        // Get staff with pagination and sorting
        const staff = await Staff.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('teams', 'name sport image')
            .populate('createdBy', 'name email image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: staff,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/staff/:id
 * @desc    Get single staff member by ID
 * @access  Private (Club Admin/Staff)
 */
router.get('/:id', [
    auth,
    adminCheck,
], async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
            .populate('teams', 'name sport image')
            .populate('club', 'name image')
            .populate('createdBy', 'name email image');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify user has permission to view this staff member
        if (req.user.type !== 'Club' || req.user._id.toString() !== staff.club.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this staff member'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/staff
 * @desc    Create new staff member
 * @access  Private (Club Admin)
 */
router.post('/', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty().trim().escape(),
        check('email', 'Please include a valid email').isEmail().normalizeEmail(),
        check('phone', 'Please include a valid phone number').optional().isMobilePhone(),
        check('role', 'Role is required').not().isEmpty().trim().escape(),
        check('club', 'Club ID is required').not().isEmpty().trim().escape(),
        check('employmentType', 'Invalid employment type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Volunteer']),
        check('salary', 'Salary must be a number').optional().isNumeric()
    ]
], async (req, res) => {
    console.log(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, club } = req.body;

        // Verify user has permission to add staff to this club
        if (req.user.type !== 'Club' || req.user._id.toString() !== club) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add staff to this club'
            });
        }

        // Check if staff already exists
        let staff = await Staff.findOne({ email, club });
        if (staff) {
            return res.status(400).json({
                success: false,
                message: 'Staff member with this email already exists for this club'
            });
        }

        // Create new staff
        staff = new Staff({
            ...req.body,
            createdBy: req.user.id,
            image: req.file ? req.file.path : undefined
        });

        await staff.save();

        // Populate the response
        staff = await Staff.findById(staff._id)
            .populate('club', 'name image')
            .populate('createdBy', 'name email image');

        res.status(201).json({
            success: true,
            data: staff,
            message: 'Staff member created successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member
 * @access  Private (Club Admin)
 */
router.put('/:id', [
    auth,
    adminCheck,
    [
        check('name', 'Name is required').optional().not().isEmpty().trim().escape(),
        check('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
        check('phone', 'Please include a valid phone number').optional().isMobilePhone(),
        check('role', 'Role is required').optional().not().isEmpty().trim().escape(),
        check('employmentType', 'Invalid employment type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Volunteer']),
        check('salary', 'Salary must be a number').optional().isNumeric()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        let staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify user has permission to update this staff member
        if (req.user.type !== 'Club' || req.user._id.toString() !== staff.club.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this staff member'
            });
        }

        // Prevent changing email and club
        if (req.body.email && req.body.email !== staff.email) {
            return res.status(400).json({
                success: false,
                message: 'Email cannot be changed'
            });
        }
        if (req.body.club && req.body.club !== staff.club.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Club cannot be changed'
            });
        }

        // Update staff
        const updates = {
            ...req.body,
            updatedAt: Date.now()
        };

        staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate('teams', 'name sport image')
            .populate('club', 'name image')
            .populate('createdBy', 'name email image');

        res.json({
            success: true,
            data: staff,
            message: 'Staff member updated successfully'
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   DELETE /api/staff/:id
 * @desc    Delete staff member
 * @access  Private (Club Admin)
 */
router.delete('/:id', [
    auth,
    adminCheck,
], async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify user has permission to delete this staff member
        if (req.user.type !== 'Club' || req.user._id.toString() !== staff.club.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this staff member'
            });
        }

        // TODO: Handle image deletion if exists
        await staff.remove();

        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;