const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    agreed: Boolean,
    name: String,
    email: String,
    phone: String,
    country: String,
    password: String,
    children: {
        type: [String],
        default: null
    },
    dob: {
        day: String,
        month: String,
        year: String
    },
    parentEmail: String,
    type: String,
    sport: String,
    club: String,
    gender: String,
    image: String,
    bio: String,
    height: Number,
    weight: Number,
    highlights: String,
    stats: String,
    achievements: String,
    events: String,
    skills: {
        attack: Number,
        skill: Number,
        stamina: Number,
        speed: Number,
        defense: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
