const mongoose = require("mongoose");

const TimesheetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Timesheet", TimesheetSchema);
