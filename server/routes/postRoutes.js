// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');


// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, '123456', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        console.log('Decoded Token:', decoded); // Add this line
        req.user = decoded; // decoded contains userId
        next();
    });
};

// Get paginated posts
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const posts = await Post.find({ linked: true })
            .populate('created_by', '_id name image gender')
            .populate('likes', '_id name image')
            .populate('comments.user', '_id name image')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
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

        console.log("New Post created: ", newPost)

        res.status(201).json({ success: true, post: newPost });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, message: 'Server error while creating post' });
    }
});

// like/unlike
router.post('/like/:postId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const postId = req.params.postId;


    console.log('User ID:', userId);

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        await post.populate('likes', '_id name image');

        console.log("post= ",post.created_by)

        if (!hasLiked) {
            const userThatLiked = await User.findById(userId).select('name');

            const userToNotify = await User.find({
                _id: post.created_by,
                expoPushToken: { $exists: true, $ne: null }
            });

            const notificationTitle = `${userThatLiked.name} liked your post`;
            const notificationBody = ``;

            // Send notification
            try {
                await sendNotification(
                    userToNotify,
                    notificationTitle,
                    notificationBody,
                    { postId: post._id.toString() });
            } catch (err) {
                console.error(`Failed to send notification to user ${userToNotify._id}:`, err.message);
            }
        }

        res.status(200).json({ likes: post.likes });
    } catch (err) {
        console.error('Error liking post:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// get comments
router.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId).populate('comments.user', '_id name image gender');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const sortedComments = [...post.comments].reverse();

        res.status(200).json({ comments: sortedComments });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// add comments
router.post('/comments/:postId', authenticateToken, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = {
            user: req.user.userId,
            content
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(postId).populate('comments.user', '_id name image');
        const sortedComments = [...populatedPost.comments].reverse();

        res.status(201).json({ comments: sortedComments });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Soft delete a post
router.put('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Only allow the creator to unlink
        if (post.created_by.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to unlink this post' });
        }

        post.linked = false;
        post.lastLinked = new Date();
        await post.save();

        res.json({ message: 'Post unlinked successfully', post });
    } catch (err) {
        console.error('Unlink error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
