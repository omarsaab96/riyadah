const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: String,
  sport: String,
  ageGroup: String,
  gender: String,
  image: String,
  club: mongoose.Schema.ObjectId,
  coaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [mongoose.Schema.ObjectId],
  createdAt: Date,
});

// Index for better query performance
TeamSchema.index({ club: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);