const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    dob: {
      day: Number,
      month: Number,
      year: Number,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    role: {
      type: String,
      enum: [
        'Coach',
        'Assistant Coach',
        'Manager',
        'Admin',
        'Board Member',
        'Medical Staff',
        'Other',
      ],
      default: 'Coach',
    },
    specialization: String,
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Volunteer'],
      default: 'Full-time',
    },
    salary: String,
    bio: String,
    qualifications: [String],
    certifications: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: String, // If you want to store image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema, 'staff');

