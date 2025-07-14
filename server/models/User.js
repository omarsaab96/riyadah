const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  achievements: String,
  admin: {
    name: String,
    email: String,
    id: String
  },
  agreed: Boolean,
  bio: String,
  children: [String],
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
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
  country: String,
  dob: {
    day: String,
    month: String,
    year: String
  },
  email: String,
  events: String,
  gender: String,
  height: Number,
  highlights: String,
  image: String,
  isStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  memberOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: []
  }],
  name: String,
  organization: {
    name: String,
    role: String,
    location: String,
    since: String,
    independent: Boolean
  },
  parentEmail: String,
  password: String,
  personalAccount: {
    type: Boolean,
    default: true
  },
  phone: String,
  role: String,
  skills: {
    attack: Number,
    skill: Number,
    stamina: Number,
    speed: Number,
    defense: Number
  },
  sport: [String],
  stats: String,
  type: String,
  verified: {
    type: Date,
    default: null
  },
  weight: Number
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
