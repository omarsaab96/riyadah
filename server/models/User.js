const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    agreed: Boolean,
    name: String,
    email: String,
    phone: String,
    country: String,
    password: String,
    children: [String],
    admin: {
        name: String,
        email: String,
        id: String
    },
    contactInfo: {
        phone: String,
        email: String,
        facebook: String,
        instagram: String,
        whatsapp: String,
        telegram: String,
        tiktok: String,
        snapchat: String,
        location: {
            latitude: String,
            longitude: String
        },
        description: String
    },
    dob: {
        day: String,
        month: String,
        year: String
    },
    parentEmail: String,
    type: String,
    sport: [String],
    club: String,
    organization: {
        name: String,
        role: String,
        location: String,
        since: String,
        independent: Boolean
    },
    gender: String,
    image: String,
    bio: String,
    height: Number,
    weight: Number,
    highlights: String,
    stats: String,
    achievements: String,
    events: String,
    isStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        default: null
    },
    personalAccount: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Date,
        default: null
    },
    skills: {
        attack: Number,
        skill: Number,
        stamina: Number,
        speed: Number,
        defense: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
