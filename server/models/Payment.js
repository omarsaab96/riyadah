// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'transaction' },
  amount: { type: Number, required: true },
  currency: { type: String, default:'EGP' },
  note: String,
  status: { type: String, enum: ['pending', 'completed', 'declined'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);