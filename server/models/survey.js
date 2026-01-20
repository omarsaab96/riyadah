const mongoose = require('mongoose');

const surveyOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const surveyQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['rating', 'single', 'multi', 'text', 'long-text'],
    required: true
  },
  description: { type: String, default: '' },
  required: { type: Boolean, default: true },
  options: [surveyOptionSchema],
  scale: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
    step: { type: Number, default: 1 },
  }
}, { _id: true });

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  questions: [surveyQuestionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);
