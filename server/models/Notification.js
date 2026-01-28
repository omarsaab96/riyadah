
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'info',
      'alert',
      'system',
      'survey',
      'event',
      'event_reminder',
      'monthly_payment_reminder',
      'offer',
      'post_like',
      'post_comment',
      'team_member',
      'team_coach',
      'chat_message'
    ],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  linked: {
    type: Boolean,
    default: true
  },
  ticket: {
    type: Array,
    default: []
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
