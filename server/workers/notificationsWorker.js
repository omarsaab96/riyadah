// workers/notificationsWorker.js
const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const { sendNotification } = require('../utils/notificationService');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const TICK_MS = 3000;
const MAX_ATTEMPTS = 5;
const CONCURRENCY = 20; // send 20 in parallel per chunk

async function notify(job){
  const { eventId, createdBy } = job.payload;

  const event = await Schedule.findById(eventId)
    .populate('team', 'members coaches club')
    .populate('createdBy', 'type')
    .lean();

  if (!event) throw new Error('Event not found');

  const team = event.team;
  const creatorType = event.createdBy?.type;

  let userIds = [];
  if (creatorType === 'Coach') userIds = [...team.members, team.club];
  else if (creatorType === 'Club') userIds = [...team.members, ...team.coaches];
  else userIds = [...team.members]; // fallback

  const users = await User.find({
    _id: { $in: userIds },
    expoPushToken: { $exists: true, $ne: null }
  }).lean();

  const title = '📅 New Event';
  const body  = `You have a new ${event.eventType} scheduled for ${formatDate(event.date)} at ${formatTime(event.startTime)}.`;
  const data  = { eventId: event._id.toString() };

  // send with simple concurrency control (no external libs)
  let i = 0;
  while (i < users.length) {
    const slice = users.slice(i, i + CONCURRENCY);
    await Promise.allSettled(slice.map(u =>
      sendNotification(u, title, body, data).catch(e => {
        console.error('push error', u._id.toString(), e.message);
      })
    ));
    i += CONCURRENCY;
  }
}

function formatDate(d){ const x = new Date(d); return x.toLocaleDateString('en-GB'); }
function formatTime(d){ const x = new Date(d); return x.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:true}); }

async function tick(){
  const job = await Job.findOneAndUpdate(
    { status: 'queued', type: 'notify', runAt: { $lte: new Date() } },
    { $set: { status: 'running' }, $inc: { attempts: 1 } },
    { sort: { runAt: 1 } }
  );
  if (!job) return;

  try{
    await notify(job);
    await Job.updateOne({_id: job._id}, { $set: { status: 'done', lastError: null } });
  }catch(err){
    console.error('notify error:', err.message);
    const update = { $set: { status: job.attempts >= MAX_ATTEMPTS ? 'failed':'queued', lastError: err.message } };
    if (job.attempts < MAX_ATTEMPTS) update.$set.runAt = new Date(Date.now()+ 30_000);
    await Job.updateOne({_id: job._id}, update);
  }
}

setInterval(tick, TICK_MS);
