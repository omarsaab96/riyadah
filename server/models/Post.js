// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    type: { type: String, enum: ['text', 'image', 'video'], required: true },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    isLiked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Post', PostSchema);
