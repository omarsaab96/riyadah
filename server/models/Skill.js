// models/Skill.js
const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    testedSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastTested: {
        type: Date,
        default: null,
    },
    results: [{
        testedSkill: { type: String, required: true },
        score: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
