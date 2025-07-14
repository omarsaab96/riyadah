// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  type: { type: String, required: true }, // e.g., "registration", "monthly"
  amount: { type: Number, required: true },
  dueDate: Date,
  paid: { type: Boolean, default: false },
  paidDate: Date,
  note: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);