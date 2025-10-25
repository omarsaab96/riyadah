// workers/thirtyMinutesEventReminder.js
// Sends notifications to users 30 minutes before their scheduled events start
// Runs every minute to check for upcoming events
// Marks events as notified to avoid duplicate notifications

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Team = require('../models/Team');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');

const MONGO_URI = process.env.MONGO_URI;

const TICK_MS = 60 * 1000; // every minute
let isProcessing = false;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[30MinutesEventsReminder] MongoDB connected'))
  .catch((err) => {
    console.error('[30MinutesEventsReminder] MongoDB connection error:', err.message);
    process.exit(1);
  });

async function sendEventReminders() {
  const now = new Date();
  const next30Min = new Date(now.getTime() + 30 * 60 * 1000);

  console.log(`[30MinutesEventsReminder] Checking events starting within 30 min...`);

  const events = await Schedule.find({
    status: 'scheduled',
    startTime: { $gte: now, $lte: next30Min },
    $or: [
      { notifiedBeforeStart: { $ne: true } },
      { notifiedBeforeStart: { $exists: false } },
    ],
  })
    .populate('team')
    .lean();

  if (!events.length) {
    console.log('[30MinutesEventsReminder] No events found.');
    return;
  }

  for (const e of events) {
    try {
      let userIds = [];

      if (e.team) {
        const team = await Team.findById(e.team).select('members coaches').lean();
        if (team) userIds = [...(team.members || []), ...(team.coaches || [])];
      }

      if (e.coaches?.length) userIds.push(...e.coaches.map(String));
      if (e.participants?.length) userIds.push(...e.participants.map((p) => p.user.toString()));
      userIds = [...new Set(userIds)];

      if (!userIds.length) continue;

      const users = await User.find({
        _id: { $in: userIds },
        expoPushToken: { $ne: null },
      }).lean();

      if (!users.length) continue;

      const title = '⏰ Event Reminder';
      const body = `"${e.title}" starts in 30 minutes!`;
      const payload = { eventId: e._id, type: 'event_reminder' };

      for (const user of users) {
        try {
          await sendNotification(user, title, body, payload, true);
        } catch (err) {
          console.error(`[30MinutesEventsReminder] Failed to notify ${user._id}:`, err.message);
        }
      }

      await Schedule.updateOne({ _id: e._id }, { $set: { notifiedBeforeStart: true } });
      console.log(`[30MinutesEventsReminder] Notified ${users.length} users for "${e.title}".`);
    } catch (err) {
      console.error(`[30MinutesEventsReminder] Error processing "${e.title}":`, err.message);
    }
  }
}

async function tick() {
  if (isProcessing) {
    console.log('[30MinutesEventsReminder] Busy, skipping tick...');
    return;
  }
  isProcessing = true;
  try {
    await sendEventReminders();
  } catch (err) {
    console.error('[30MinutesEventsReminder] Error:', err.message);
  } finally {
    isProcessing = false;
  }
}

setInterval(() => tick(), TICK_MS);
console.log('[30MinutesEventsReminder] Worker started, checking every minute...');
