const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
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

// Middleware (for pagination, filtering, etc.)
const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
router.get('/', advancedResults(Team, 'club coach members'), async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('club', 'name image')
      .populate('coach', 'name image')
      .populate('members', 'name image');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Club only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is a club
    if (req.user.type !== 'Club') {
      return res.status(403).json({
        success: false,
        message: 'Only clubs can create teams'
      });
    }

    const { name, sport, ageGroup, gender, image } = req.body;

    // Check if team already exists for this club
    const existingTeam = await Team.findOne({ name, club: req.user.id });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team with this name already exists for your club'
      });
    }

    const teamData = {
      name,
      sport,
      ageGroup,
      gender,
      club: req.user.id,
      image
    };

    const team = await Team.create(teamData);

    // Add team to club's teams array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { teams: team._id } },
      { new: true }
    );

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Club admin or coach)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify ownership or coach assignment
    if (team.club.toString() !== req.user.id &&
      (!team.coach || team.coach.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    const { name, sport, ageGroup, gender, image } = req.body;
    const updateData = { name, sport, ageGroup, gender, image };

    team = await Team.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Club admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify ownership
    if (team.club.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this team'
      });
    }

    await team.remove();

    // Remove team from club's teams array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { teams: team._id } },
      { new: true }
    );

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Assign coach to team
// @route   PUT /api/teams/:id/coach
// @access  Private (Club admin only)
router.put('/:id/coach', authenticateToken, async (req, res) => {
  try {
    const { coachId } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify ownership
    if (team.club.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this team'
      });
    }

    // Check if coach exists and is actually a coach
    const coach = await User.findById(coachId);
    if (!coach || coach.type !== 'Coach') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID provided'
      });
    }

    // Update team with new coach
    team.coach = coachId;
    await team.save();

    // Add team to coach's teams array
    await User.findByIdAndUpdate(
      coachId,
      { $addToSet: { teams: team._id } },
      { new: true }
    );

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;