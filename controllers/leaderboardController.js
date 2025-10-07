const leaderboardService = require('../services/leaderboardService');

/**
 * @desc    Get the leaderboard
 * @route   GET /api/leaderboard?period=weekly
 * @access  Public
 */
exports.getLeaderboard = async (req, res, next) => {
    try {
        const { period, limit } = req.query;
        const validPeriods = ['weekly', 'monthly'];
        const selectedPeriod = validPeriods.includes(period) ? period : 'weekly';

        const leaderboard = await leaderboardService.getLeaderboard(selectedPeriod, parseInt(limit) || 10);
        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
};