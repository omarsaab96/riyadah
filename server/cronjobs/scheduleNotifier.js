// cronjobs/scheduleNotifier.js
require('dotenv').config();
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Team = require('../models/Team');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');

const MONGO_URI = 'mongodb+srv://omarsaab96:heBNAngdPP6paAHk@cluster0.goljzz8.mongodb.net/riyadahDB?retryWrites=true&w=majority&appName=Cluster0';

async function runReminder() {
  const now = new Date();
  const next30Min = new Date(now.getTime() + 30 * 60 * 1000);

  console.log(`[${now.toISOString()}] 🔍 Checking events starting within 30 minutes...`);

  const events = await Schedule.find({
    status: 'scheduled',
    startTime: { $gte: now, $lte: next30Min },
    $or: [{ notifiedBeforeStart: { $ne: true } }, { notifiedBeforeStart: { $exists: false } }]
  })
    .populate('team')
    .lean();

  if (!events.length) {
    console.log('✅ No upcoming events found within the next 30min.');
    return;
  }

  console.log(`Found ${events.length} upcoming event(s).`);

  for (const e of events) {
    try {
      let userIds = [];

      // Get team members + coaches
      if (e.team) {
        const team = await Team.findById(e.team)
          .select('members coaches')
          .lean();
        if (team) {
          userIds = [...(team.members || []), ...(team.coaches || [])];
        }
      }

      // Add explicit schedule-level coaches if present
      if (e.coaches?.length) {
        const extraCoaches = await User.find({ _id: { $in: e.coaches } }).lean();
        userIds.push(...extraCoaches.map((u) => u._id));
      }

      // Add participants if defined
      if (e.participants?.length) {
        const participantIds = e.participants.map((p) => p.user);
        userIds.push(...participantIds);
      }

      // Remove duplicates
      userIds = [...new Set(userIds.map((id) => id.toString()))];

      if (!userIds.length) {
        console.log(`⚠️ No users found for event "${e.title}".`);
        continue;
      }

      // Fetch full user docs for notifications
      const users = await User.find({
        _id: { $in: userIds },
        expoPushToken: { $ne: null }
      }).lean();

      if (!users.length) {
        console.log(`⚠️ No users with valid Expo tokens for "${e.title}".`);
        continue;
      }

      // Prepare message
      const message = `⏰ Reminder: "${e.title}" starts in 30 minutes!`;

      // Send notifications one by one (or parallel if safe)
      for (const user of users) {
        try {
          await sendNotification(
            user,
            'Event Reminder',
            message,
            { eventId: e._id, type: 'event_reminder' },
            true // save notification in DB
          );
        } catch (notifyErr) {
          console.error(`❌ Failed to notify ${user.name || user._id}:`, notifyErr.message);
        }
      }

      // Mark event as notified
      await Schedule.updateOne(
        { _id: e._id },
        { $set: { notifiedBeforeStart: true } }
      );

      console.log(`✅ Notified ${users.length} users for "${e.title}".`);
    } catch (err) {
      console.error(`❌ Error processing "${e.title}":`, err);
    }
  }
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await runReminder();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
})();
