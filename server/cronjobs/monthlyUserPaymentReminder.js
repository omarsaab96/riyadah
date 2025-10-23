// cronjobs/paymentReminderWorker.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');

const MONGO_URI = 'mongodb+srv://omarsaab96:heBNAngdPP6paAHk@cluster0.goljzz8.mongodb.net/riyadahDB?retryWrites=true&w=majority&appName=Cluster0';

async function sendPaymentReminders() {
  console.log(`[${new Date().toISOString()}] 🔍 Starting payment reminder job...`);

  // Find all athletes linked to at least one club and with a valid Expo token
  const athletes = await User.find({
    type: 'Athlete',
    clubs: { $exists: true, $not: { $size: 0 } },
    expoPushToken: { $ne: null },
  })
    .select('_id name expoPushToken clubs')
    .lean();

  if (!athletes.length) {
    console.log('✅ No athletes found with clubs.');
    return;
  }

  console.log(`📦 Found ${athletes.length} athletes to notify.`);

  const title = '💳 Payment Reminder';

  let successCount = 0;

  // Loop through each athlete and send a notification
  for (const athlete of athletes) {
    try {
      await sendNotification(
        athlete,
        title,
        `Dear ${athlete.name}, please note that your club membership fee is due. Contact your club admin for assistance.`,
        { type: 'payment_reminder', clubs: athlete.clubs },
        true
      );
      successCount++;
      console.log(`✅ Reminder sent to ${athlete.name || athlete._id}`);
    } catch (err) {
      console.error(`❌ Failed to notify ${athlete.name || athlete._id}:`, err.message);
    }
  }

  console.log(`📬 Sent ${successCount}/${athletes.length} payment reminders.`);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await sendPaymentReminders();
  } catch (err) {
    console.error('❌ Error running payment reminder worker:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
})();
