const express = require('express');
const jwt = require('jsonwebtoken');
const Sport = require('../models/Sport');
const User = require('../models/User');

const router = express.Router();

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

const requireManager = (req, res, next) => {
  if (req.user?.type !== 'Manager') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const includeHidden = req.query.includeHidden === 'true';
    if (includeHidden) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token, authorization denied'
        });
      }

      const decoded = jwt.verify(token, '123456');
      const user = await User.findById(decoded.userId);
      if (!user || user.type !== 'Manager') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }
    }

    const query = includeHidden ? {} : { isVisible: true };
    const sports = await Sport.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: sports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticate, requireManager, async (req, res) => {
  try {
    const { name, icon, isVisible } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const existing = await Sport.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Sport already exists' });
    }

    const sport = await Sport.create({
      name: name.trim(),
      icon: icon || null,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true
    });

    res.status(201).json({ success: true, data: sport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', authenticate, requireManager, async (req, res) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name && name.trim()) {
      const existing = await Sport.findOne({ name: name.trim() });
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json({ success: false, message: 'Sport already exists' });
      }
      update.name = name.trim();
    }

    const sport = await Sport.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }

    res.json({ success: true, data: sport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/visibility', authenticate, requireManager, async (req, res) => {
  try {
    const { isVisible } = req.body;
    if (isVisible === undefined) {
      return res.status(400).json({ success: false, message: 'isVisible is required' });
    }

    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      { isVisible: Boolean(isVisible) },
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }

    res.json({ success: true, data: sport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:id/icon', authenticate, requireManager, async (req, res) => {
  try {
    const { icon } = req.body;
    if (!icon) {
      return res.status(400).json({ success: false, message: 'Icon is required' });
    }

    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      { icon },
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }

    res.json({ success: true, data: sport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireManager, async (req, res) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
