// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get paginated posts
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const posts = await Post.find()
            .populate('created_by', '_id name image')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/', async (req, res) => {
    try {
        const {
            type,
            created_by,
            content = '',
            media = { images: [], videos: [] },
        } = req.body;

        if (!type || !created_by) {
            return res.status(400).json({ success: false, message: 'Missing required fields: type or created_by' });
        }

        const newPost = new Post({
            type,
            created_by,
            content,
            media,
        });

        await newPost.save();

        res.status(201).json({ success: true, post: newPost });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, message: 'Server error while creating post' });
    }
});

module.exports = router;
