const wordbookService = require('../services/wordbookService');

/**
 * @desc    Add a word to the user's wordbook
 * @route   POST /api/wordbook
 * @access  Private
 */
exports.addWordToBook = async (req, res, next) => {
    try {
        const newWord = await wordbookService.addWord(req.user.id, req.body);
        res.status(201).json(newWord);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all words from the user's wordbook
 * @route   GET /api/wordbook
 * @access  Private
 */
exports.getWordsFromBook = async (req, res, next) => {
    try {
        const result = await wordbookService.getWords(req.user.id, {
            page: req.query.page,
            limit: req.query.limit,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get words due for review
 * @route   GET /api/wordbook/review
 * @access  Private
 */
exports.getReviewWords = async (req, res, next) => {
    try {
        const words = await wordbookService.getReviewWords(req.user.id);
        res.json(words);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a word's review status
 * @route   POST /api/wordbook/review/:id
 * @access  Private
 */
exports.updateReviewStatus = async (req, res, next) => {
    try {
        const { performance } = req.body; // e.g., a number from 0 (forgot) to 5 (perfect)
        if (performance === undefined || performance < 0 || performance > 5) {
            return res.status(400).json({ message: 'Performance rating (0-5) is required.' });
        }

        const updatedWord = await wordbookService.updateReview(req.params.id, req.user.id, performance);
        res.json(updatedWord);
    } catch (error) {
        next(error);
    }
};