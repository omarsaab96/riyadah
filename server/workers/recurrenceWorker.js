// workers/recurrenceWorker.js
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Schedule = require('../models/Schedule');
// load env & connect
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const TICK_MS = 3000;   // poll every 3s
const BATCH_LIMIT = 1;  // number of jobs per tick (keep simple)
const MAX_ATTEMPTS = 5;

function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function addWeeks(d,n){ return addDays(d, n*7); }
function addMonthsStrict(d,n){
  // strict "same day number" (we already reject 28-31 at creation)
  const base = new Date(d);
  const day = base.getDate();
  const x = new Date(base);
  x.setMonth(x.getMonth()+n);
  if (x.getDate() !== day) throw new Error('Monthly shift produced invalid day (should not happen due to guard)');
  return x;
}

async function expandSeries(job){
  const { seriesId, baseEventId, repeats, until } = job.payload;
  const base = await Schedule.findById(baseEventId).lean();
  if (!base) throw new Error('Base event not found');

  const endBoundary = new Date(until);
  const start0 = new Date(base.startTime);
  const end0   = new Date(base.endTime);
  const date0  = new Date(base.date);

  const docs = [];
  let idx = 1; // 0 is the already created first occurrence
  let nextDate = new Date(date0);

  while (true) {
    if (repeats === 'Daily')      nextDate = addDays(nextDate, idx === 1 ? 1 : 1);
    else if (repeats === 'Weekly') nextDate = addWeeks(nextDate, idx === 1 ? 1 : 1);
    else if (repeats === 'Monthly') nextDate = addMonthsStrict(nextDate, idx === 1 ? 1 : 1);
    else break;

    if (nextDate > endBoundary) break;

    // align times to nextDate's Y/M/D
    const s = new Date(start0); s.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    const e = new Date(end0);   e.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());

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

  // Bulk insert; skip duplicates via ordered:false
  await Schedule.insertMany(docs, { ordered: false }).catch(err => {
    // duplicate key errors are fine due to unique index
    // log other errors if needed
    const dup = err?.writeErrors?.every(e => e.code === 11000);
    if (!dup) throw err;
  });
}

async function tick(){
  // pick the earliest queued job of type 'expand-series'
  const job = await Job.findOneAndUpdate(
    { status: 'queued', type: 'expand-series', runAt: { $lte: new Date() } },
    { $set: { status: 'running' }, $inc: { attempts: 1 } },
    { sort: { runAt: 1 } }
  );

  if (!job) return;

  try{
    await expandSeries(job);
    await Job.updateOne({_id: job._id}, { $set: { status: 'done', lastError: null } });
  }catch(err){
    console.error('expand-series error:', err.message);
    const update = { $set: { status: job.attempts >= MAX_ATTEMPTS ? 'failed':'queued', lastError: err.message } };
    if (job.attempts < MAX_ATTEMPTS) update.$set.runAt = new Date(Date.now()+ 30_000); // retry in 30s
    await Job.updateOne({_id: job._id}, update);
  }
}

setInterval(async () => {
  for (let i=0;i<BATCH_LIMIT;i++) await tick();
}, TICK_MS);
