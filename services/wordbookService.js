const WordbookEntry = require('../models/WordbookEntry');
const httpError = require('http-errors');

/**
 * Adds a new word to the user's wordbook.
 * @param {string} userId - The ID of the user.
 * @param {object} wordData - The data for the new word.
 * @returns {Promise<object>} - The newly created wordbook entry.
 */
exports.addWord = async (userId, wordData) => {
    const { word, meaning, pronunciation, notes, lessonSource } = wordData;

    const existingEntry = await WordbookEntry.findOne({ user: userId, word });
    if (existingEntry) {
        throw httpError.Conflict('This word is already in your wordbook.');
    }

    const newEntry = await WordbookEntry.create({
        user: userId,
        word,
        meaning,
        pronunciation,
        notes,
        lessonSource
    });
    return newEntry;
};

/**
 * Retrieves all words from a user's wordbook with pagination.
 * @param {string} userId - The ID of the user.
 * @param {object} pagination - Pagination options (page, limit).
 * @returns {Promise<Array>} - A list of wordbook entries.
 */
exports.getWords = async (userId, pagination = {}) => {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const words = await WordbookEntry.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await WordbookEntry.countDocuments({ user: userId });

    return {
        words,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalWords: total,
        },
    };
};

/**
 * Retrieves words that are due for review today.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - A list of wordbook entries to review.
 */
exports.getReviewWords = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const wordsToReview = await WordbookEntry.find({
        user: userId,
        nextReviewDate: { $lte: new Date() } // Get words due today or overdue
    })
    .sort({ nextReviewDate: 1 }) // Prioritize overdue words
    .limit(20) // Limit to a manageable batch size
    .lean();

    return wordsToReview;
};

/**
 * Updates a word's spaced repetition data based on user performance.
 * @param {string} entryId - The ID of the wordbook entry.
 * @param {string} userId - The ID of the user.
 * @param {number} performance - User's performance rating (e.g., 0-5).
 * @returns {Promise<object>} - The updated wordbook entry.
 */
exports.updateReview = async (entryId, userId, performance) => {
    const entry = await WordbookEntry.findOne({ _id: entryId, user: userId });
    if (!entry) {
        throw httpError.NotFound('Wordbook entry not found.');
    }

    // Simple SM-2 algorithm implementation
    if (performance < 3) { // If performance is poor (e.g., "Forgot")
        entry.repetition = 0;
        entry.interval = 1;
    } else {
        entry.repetition += 1;
        if (entry.repetition === 1) {
            entry.interval = 1;
        } else if (entry.repetition === 2) {
            entry.interval = 6;
        } else {
            entry.interval = Math.round(entry.interval * entry.easeFactor);
        }
    }

    // Update ease factor
    entry.easeFactor = entry.easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
    if (entry.easeFactor < 1.3) {
        entry.easeFactor = 1.3; // Minimum ease factor
    }

    // Set next review date
    const now = new Date();
    entry.nextReviewDate = new Date(now.setDate(now.getDate() + entry.interval));

    await entry.save();
    return entry;
};