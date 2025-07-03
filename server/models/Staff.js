const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        // required: [true, 'Email is required'],
        // unique: true,
        // trim: true,
        // lowercase: true,
        // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    dob: {
        day: Number,
        month: Number,
        year: Number
    },
    gender: {
        type: String || null,
        enum: ['Male', 'Female'],
        default: null
    },

    // Professional Information
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['Coach', 'Assistant Coach', 'Manager', 'Admin', 'Board Member', 'Medical Staff'],
        default: 'Coach'
    },
    specialization: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    qualifications: {
        type: [String],
        default: []
    },
    certifications: {
        type: [String],
        default: []
    },

    // Club Association
    club: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    isActive: {
        type: Boolean,
        default: true
    },

    // Employment Details
    joinDate: {
        type: Date,
        default: Date.now
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Volunteer'],
        default: 'Full-time'
    },
    salary: {
        type: Number,
        default: 0
    },

    // Contact Information
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },

    // System Fields
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
staffSchema.index({ club: 1, isActive: 1 });
staffSchema.index({ email: 1 }, { unique: true });
staffSchema.index({ name: 'text', email: 'text', role: 'text' });

// Virtual for full address
staffSchema.virtual('fullAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

// Virtual for age calculation
staffSchema.virtual('age').get(function () {
    if (!this.dob || !this.dob.year) return null;
    const today = new Date();
    const birthDate = new Date(this.dob.year, this.dob.month - 1, this.dob.day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Pre-save hook to update timestamps
staffSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Staff', staffSchema);