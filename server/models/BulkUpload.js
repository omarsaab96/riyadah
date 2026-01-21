const mongoose = require('mongoose');

const bulkRowSchema = new mongoose.Schema(
  {
    rowNumber: Number,
    name: String,
    email: String,
    phone: String,
    gender: String,
    sport: String,
    clubName: String,
    clubEmail: String,
    country: String
  },
  { _id: false }
);

const bulkErrorSchema = new mongoose.Schema(
  {
    rowNumber: Number,
    message: String
  },
  { _id: false }
);

const bulkUploadSchema = new mongoose.Schema(
  {
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, default: null },
    status: { type: String, default: 'preview' },
    rows: { type: [bulkRowSchema], default: [] },
    errors: { type: [bulkErrorSchema], default: [] },
    totalRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BulkUpload', bulkUploadSchema);
