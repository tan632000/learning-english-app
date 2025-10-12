const FlashcardSet = require('../models/FlashcardSet');
const httpError = require('http-errors');

/**
 * Get all published flashcard sets.
 * @returns {Promise<Array>} - A list of flashcard sets.
 */
exports.getAllSets = async () => {
    return await FlashcardSet.find({ isPublished: true })
        .populate('author', 'username')
        .select('-flashcards'); // Don't include all cards in the list view
};

/**
 * Get a single flashcard set by its ID.
 * @param {string} setId - The ID of the flashcard set.
 * @returns {Promise<object>} - The flashcard set object.
 */
exports.getSetById = async (setId) => {
    const set = await FlashcardSet.findOne({ _id: setId, isPublished: true })
        .populate('author', 'username');
    if (!set) {
        throw httpError.NotFound('Flashcard set not found or not published.');
    }
    return set;
};

/**
 * Create a new flashcard set.
 * @param {object} setData - The data for the new set.
 * @param {string} authorId - The ID of the author.
 * @returns {Promise<object>} - The newly created flashcard set.
 */
exports.createSet = async (setData, authorId) => {
    return await FlashcardSet.create({ ...setData, author: authorId });
};

/**
 * Update an existing flashcard set.
 * @param {string} setId - The ID of the set to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user performing the update.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<object>} - The updated flashcard set.
 */
exports.updateSet = async (setId, updateData, userId, userRole) => {
    const set = await FlashcardSet.findById(setId);
    if (!set) {
        throw httpError.NotFound('Flashcard set not found.');
    }

    if (set.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to update this flashcard set.');
    }

    Object.assign(set, updateData);
    await set.save();
    return set;
};

/**
 * Delete a flashcard set.
 * @param {string} setId - The ID of the set to delete.
 * @param {string} userId - The ID of the user performing the delete.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<void>}
 */
exports.deleteSet = async (setId, userId, userRole) => {
    const set = await FlashcardSet.findById(setId);
    if (!set) {
        throw httpError.NotFound('Flashcard set not found.');
    }

    if (set.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this flashcard set.');
    }

    await set.deleteOne();
};