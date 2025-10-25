// workers/recurrenceWorker.js
// This worker will expand recurring events based on their recurrence rules.
// It runs every 3 seconds to check for new recurrence expansion jobs.
// It processes one job at a time to avoid overload.

const mongoose = require('mongoose');
const Job = require('../models/Job');
const Schedule = require('../models/Schedule');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

// === CONFIG ===
const TICK_MS = 3000;       // run every 3 seconds
const BATCH_LIMIT = 1;      // process one job per tick
const MAX_ATTEMPTS = 5;

let isProcessing = false;   // prevent overlap between ticks

// === HELPERS ===
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addWeeks(d, n) { return addDays(d, n * 7); }
function addMonthsStrict(d, n) {
  const base = new Date(d);
  const day = base.getDate();
  const x = new Date(base);
  x.setMonth(x.getMonth() + n);
  if (x.getDate() !== day) throw new Error('Monthly shift invalid day (e.g. 31st)');
  return x;
}

// === MAIN EXPANSION LOGIC ===
async function expandSeries(job) {
  const { seriesId, baseEventId, repeats, until } = job.payload;
  const base = await Schedule.findById(baseEventId).lean();
  if (!base) throw new Error('Base event not found');

  const endBoundary = new Date(until);
  const start0 = new Date(base.startTime);
  const end0 = new Date(base.endTime);
  const date0 = new Date(base.date);

  const docs = [];
  let idx = 1;
  let nextDate = new Date(date0);

  while (true) {
    if (repeats === 'Daily') nextDate = addDays(nextDate, 1);
    else if (repeats === 'Weekly') nextDate = addWeeks(nextDate, 1);
    else if (repeats === 'Monthly') nextDate = addMonthsStrict(nextDate, 1);
    else break;

    if (nextDate > endBoundary) break;

    const s = new Date(start0);
    s.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    const e = new Date(end0);
    e.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());

    docs.push({
      title: base.title,
      description: base.description,
      date: nextDate,
      startTime: s,
      endTime: e,
      eventType: base.eventType,
      team: base.team,
      club: base.club,
      createdBy: base.createdBy,
      repeats: base.repeats,
      seriesId,
      occurrenceIndex: idx,
      status: base.status || 'scheduled'
    });

    idx++;
  }

  if (!docs.length) return;

  await Schedule.insertMany(docs, { ordered: false }).catch(err => {
    const dup = err?.writeErrors?.every(e => e.code === 11000);
    if (!dup) throw err;
  });
}

// === TICK ===
async function tick() {
  if (isProcessing) {
    console.log('[eventExpander] Worker busy, skipping this tick...');
    return;
  }

  isProcessing = true;

  try {
    const job = await Job.findOneAndUpdate(
      { status: 'queued', type: 'expand-series', runAt: { $lte: new Date() } },
      { $set: { status: 'running' }, $inc: { attempts: 1 } },
      { sort: { runAt: 1 } }
    );

    if (!job) {
      isProcessing = false;
      return;
    }

    console.log(`[eventExpander] Expanding recurrence for job ${job._id}`);
    await expandSeries(job);

    await Job.updateOne({ _id: job._id }, { $set: { status: 'done', lastError: null } });
    console.log(`Job ${job._id} done`);
  } catch (err) {
    console.error('[eventExpander] expand-series error:', err.message);
  } finally {
    isProcessing = false;
  }
}

// === MAIN LOOP ===
setInterval(() => tick(), TICK_MS);

console.log('[eventExpander] Recurrence Worker started — checking every 3 seconds...');
