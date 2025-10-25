// workers/paymentReminderWorker.js
// Sends monthly payment reminders to athletes on the 1st of each month
// after 10am, in batches every 5 minutes.

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');

const MONGO_URI = process.env.MONGO_URI;

const TICK_MS = 5 * 60 * 1000; // check every 5 min
const BATCH_SIZE = 200;        // number of users to notify each tick

let isProcessing = false;
let currentMonthKey = null; // "2025-10" etc.

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('[MonthlyReminder] MongoDB connected'))
  .catch((err) => {
    console.error('[MonthlyReminder] MongoDB connection error:', err.message);
    process.exit(1);
  });

// keep a small in-memory progress set for the current month
let notifiedIds = new Set();

async function sendPaymentReminders() {
  const now = new Date();
  const day = now.getDate();
  const hour = now.getHours();

  // Only on the 1st of each month between 10–14h
  if (day !== 1 || hour < 10) return;

  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (currentMonthKey !== ym) {
    currentMonthKey = ym;
    notifiedIds.clear();
    console.log(`[MonthlyReminder] Starting monthly reminders for ${ym}`);
  }

  // Query only users not yet notified this month (in memory filter)
  const filter = {
    type: 'Athlete',
    role: { $ne: 'Coach' },
    clubs: { $exists: true, $not: { $size: 0 } },
    expoPushToken: { $ne: null },
    _id: { $nin: Array.from(notifiedIds) },
  };

  const athletes = await User.find(filter)
    .select('_id name expoPushToken clubs')
    .limit(BATCH_SIZE)
    .lean();

  if (!athletes.length) {
    console.log(`[MonthlyReminder] All athletes processed for ${ym}.`);
    return;
  }

  console.log(`[MonthlyReminder] Sending ${athletes.length} reminders (batch)...`);

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
      notifiedIds.add(athlete._id.toString());
    } catch (err) {
      console.error(`[MonthlyReminder] Failed to notify ${athlete._id}:`, err.message);
    }
  }

  console.log(`[MonthlyReminder] Sent ${successCount}/${athletes.length} in this batch.`);
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
console.log('[MonthlyReminder] Worker started — checking every 5 min...');
