const mongoose = require('mongoose');

const monthlySurveySchema = new mongoose.Schema({
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  injuries: String,
  injuryDetails: String,
  coachTrainingSatisfaction: Number,
  areaOfImprovement: String,
  satisfaction: Number,
  performance: String,
  recovery: String,
  sleep: String,
  mentally: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('MonthlySurvey', monthlySurveySchema);
