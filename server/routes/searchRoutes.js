const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // or any other model you're searching

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

// GET /api/search?keyword=someText
router.get('/', authenticateToken, async (req, res) => {
  const {
    keyword = '',
    type,
    userType,
    sport,
    gender,
    eventType,
    role,
    limit = 20,
  } = req.query;

  const regex = new RegExp(keyword, 'i');
  const parsedLimit = Math.min(parseInt(limit), 50);
  const results = {};

  try {
    const tasks = [];

    // Users
    if (!type || type === 'users') {
      const userFilter = {
        $and: [
          {
            $or: [
              { name: { $regex: regex } },
              { email: { $regex: regex } },
              { phone: { $regex: regex } },
              // { 'contactInfo.facebook': { $regex: regex } },
              // { 'contactInfo.instagram': { $regex: regex } },
            ],
          },
        ],
      };

      if (userType) userFilter.$and.push({ type: userType });
      if (sport) userFilter.$and.push({ sport: { $in: [sport] } });
      if (gender) userFilter.$and.push({ gender });
      if (role) userFilter.$and.push({ role });

      tasks.push(
        User.find(userFilter)
          .select('_id name email sport gender type image')
          .limit(parsedLimit)
          .then((data) => (results.users = data))
      );
    }

    // Events (Schedules)
    if (!type || type === 'events') {
      const scheduleFilter = {
        $or: [
          { title: { $regex: regex } },
          { description: { $regex: regex } },
          { venue: { $regex: regex } },
          { opponent: { $regex: regex } },
          { competition: { $regex: regex } },
          { notes: { $regex: regex } },
        ],
      };

      if (eventType) scheduleFilter.eventType = eventType;

      tasks.push(
        Schedule.find(scheduleFilter)
          .select('title description eventType startDateTime endDateTime venue createdBy')
          .limit(parsedLimit)
          .then((data) => (results.events = data))
      );
    }

    // Posts
    if (!type || type === 'posts') {
      const postFilter = {
        $or: [
          { content: { $regex: regex } },
          { 'media.images': { $regex: regex } },
        ],
      };

      tasks.push(
        Post.find(postFilter)
          .populate('created_by', 'name image type')
          .select('type content media date created_by')
          .limit(parsedLimit)
          .then((data) => (results.posts = data))
      );
    }

    await Promise.all(tasks);

    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
