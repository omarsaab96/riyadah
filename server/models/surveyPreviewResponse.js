const mongoose = require('mongoose');

const surveyPreviewAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const surveyPreviewResponseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', default: null },
  answers: [surveyPreviewAnswerSchema],
}, { timestamps: true });

module.exports = mongoose.model('SurveyPreviewResponse', surveyPreviewResponseSchema);
