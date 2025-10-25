// workers/paymentReminderWorker.js
//This worker will notify all users with type Athlete with role not coach and are not independent
//to pay their monthly club subscription fee on the 1st of each month.

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://omarsaab96:heBNAngdPP6paAHk@cluster0.goljzz8.mongodb.net/riyadahDB?retryWrites=true&w=majority&appName=Cluster0';

const TICK_MS = 3600 * 1000; // check every 1h (safe interval)
let isProcessing = false;
let lastRunKey = null; // YYYY-MM for once-per-month check

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('[MonthlyReminder] MongoDB connected'))
  .catch((err) => {
    console.error('[MonthlyReminder] MongoDB connection error:', err.message);
    process.exit(1);
  });

async function sendPaymentReminders() {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (lastRunKey === ym) return; // already ran this month
  if (now.getDate() !== 1) return; // only on the 1st

  console.log(`[MonthlyReminder] Starting monthly payment reminders...`);
  lastRunKey = ym;

  const athletes = await User.find({
    type: 'Athlete',
    role: { $ne: 'Coach' },
    clubs: { $exists: true, $not: { $size: 0 } },
    expoPushToken: { $ne: null },
  })
    .select('_id name expoPushToken clubs')
    .lean();

  if (!athletes.length) {
    console.log('✅ No athletes found.');
    return;
  }

  let successCount = 0;

  for (const athlete of athletes) {
    try {
      await sendNotification(
        athlete,
        '💳 Payment Reminder',
        `Dear ${athlete.name || 'Athlete'}, please note that your club membership fee is due today.`,
        { type: 'monthly_payment_reminder', clubs: athlete.clubs },
        true
      );
      successCount++;
    } catch (err) {
      console.error(`[MonthlyReminder] Failed to notify ${athlete._id}:`, err.message);
    }
  }

  console.log(`[MonthlyReminder] Sent ${successCount}/${athletes.length} payment reminders.`);
}

async function tick() {
  if (isProcessing) {
    console.log('[MonthlyReminder] Busy, skipping tick...');
    return;
  }
  isProcessing = true;
  try {
    await sendPaymentReminders();
  } catch (err) {
    console.error('[MonthlyReminder] Error:', err.message);
  } finally {
    isProcessing = false;
  }
}

setInterval(() => tick(), TICK_MS);
console.log('[MonthlyReminder] Monthly payment reminder worker started...');
