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
  },
  conditional: {
    questionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    values: { type: [String], default: [] }
  }
}, { _id: true });

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  repeating: {
    enabled: { type: Boolean, default: false },
    cadence: { type: String, enum: ['monthly', 'post-training'], default: null },
  },
  restrictedTo: {
    scope: { type: String, enum: ['none', 'club', 'coach', 'team'], default: 'none' },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  questions: [surveyQuestionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);
