// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get paginated posts
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const posts = await Post.find()
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

module.exports = router;
