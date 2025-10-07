const User = require('../models/User');

/**
 * Retrieves the leaderboard based on a specified period.
 * @param {string} period - The time period ('weekly' or 'monthly').
 * @param {number} limit - The number of top users to return.
 * @returns {Promise<Array>} - A list of top users.
 */
exports.getLeaderboard = async (period = 'weekly', limit = 10) => {
    const scoreField = period === 'monthly' ? 'monthlyScore' : 'weeklyScore';

    const leaderboard = await User.find()
        .sort({ [scoreField]: -1 })
        .limit(limit)
        .select('username avatarUrl ' + scoreField)
        .lean();

    // Rename the score field to a generic 'score' for consistent frontend handling
    return leaderboard.map(user => ({
        _id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        score: user[scoreField]
    }));
};