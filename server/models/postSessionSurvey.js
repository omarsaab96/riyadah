const mongoose = require('mongoose');

const postSessionSurveySchema = new mongoose.Schema({
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  intensity: Number,
  physicalFeeling: String,
  focusLevel: String,
  discomfort: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('PostSessionSurvey', postSessionSurveySchema);
