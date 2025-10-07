const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordbookEntrySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    word: {
        type: String,
        required: true,
        trim: true
    },
    meaning: {
        type: String,
        required: true
    },
    pronunciation: {
        type: String // e.g., /wɜːd/
    },
    notes: {
        type: String,
        default: ''
    },
    // Optional: to link back to the lesson where the word was found
    lessonSource: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    // --- Spaced Repetition System (SRS) Fields ---
    repetition: { type: Number, default: 0 },
    interval: { type: Number, default: 1 }, // Next review interval in days
    easeFactor: { type: Number, default: 2.5 }, // A multiplier for the interval
    nextReviewDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// To prevent a user from adding the same word twice
wordbookEntrySchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('WordbookEntry', wordbookEntrySchema);