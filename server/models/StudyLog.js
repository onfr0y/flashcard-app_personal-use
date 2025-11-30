import mongoose from 'mongoose';

const StudyLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

// Compound index to ensure one log per user per day
StudyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('StudyLog', StudyLogSchema);
