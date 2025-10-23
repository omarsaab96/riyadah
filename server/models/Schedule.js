const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    title: String,
    description: String,
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['Training', 'Match', 'Meeting', 'Tournament'],
        default: 'training'
    },
    date: Date,
    startTime: Date,
    endTime: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    isAllDay: Boolean,
    repeats: {
        type: String,
        enum: ['No', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
        default: 'No'
    },
    repeatEndDate: Date,
    locationType: String,
    location: {
        latitude: String,
        longitude: String
    },
    venue: {
        name: { type: String, default: '' },
        address: { type: String, default: '' },
    },
    onlineLink: String,
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    coaches: [String],

    // For matches
    opponent: String,
    isHomeGame: Boolean,
    competition: String,

    // For Training Sessions
    trainingFocus: String,
    requiredEquipment: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Equipment', // or whatever your equipment model is
                required: true
            },
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    // Additional Info
    // attachments: [{
    //     name: String,
    //     url: String,
    //     type: String
    // }],
    notes: String,
    isPrivate: Boolean,

    // System
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    club: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    participants: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            status: {
                type: String,
                enum: ['pending', 'confirmed', 'declined', 'tentative'],
                default: 'pending',
            },
            responseDate: Date,
        }
    ],
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled',
    },
    seriesId: { type: String, index: true },
    occurrenceIndex: { type: Number },
    notifiedBeforeStart: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster querying
scheduleSchema.index({ team: 1, date: 1 });
scheduleSchema.index({ club: 1, date: 1 });
scheduleSchema.index({ 'participants.user': 1, date: 1 });
scheduleSchema.index({ seriesId: 1, occurrenceIndex: 1 }, { unique: true, sparse: true });

// Virtual for duration (not stored in DB)
scheduleSchema.virtual('duration').get(function () {
    return (this.endTime - this.startTime) / (1000 * 60 * 60); // in hours
});

// Pre-save hook to validate dates
// scheduleSchema.pre('save', function (next) {
//     if (this.repeats !== 'No' && !this.repeatEndDate) {
//         throw new Error('Repeat end date is required for recurring events');
//     }
//     this.updatedAt = Date.now();
//     next();
// });

// Static method to get events in date range
scheduleSchema.statics.getEventsInRange = async function (clubId, date, startTime, endTime) {
    return this.find({
        club: clubId,
        date: { $eq: date },
        startTime: { $gte: startTime },
        endtime: { $lte: endTime },
        status: { $ne: 'cancelled' }
    }).populate('team participants.user coaches');
};

// Instance method to check if user is participant
scheduleSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.user.equals(userId));
};

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;