const challengeService = require('../services/challengeService');

/**
 * @desc    Get today's daily challenge
 * @route   GET /api/challenges/today
 * @access  Private
 */
exports.getChallenge = async (req, res, next) => {
    try {
        const data = await challengeService.getTodaysChallenge(req.user.id);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit today's daily challenge
 * @route   POST /api/challenges/today/submit
 * @access  Private
 */
exports.submitChallenge = async (req, res, next) => {
    try {
        const { answers } = req.body;
        const result = await challengeService.submitChallenge(req.user.id, answers);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};