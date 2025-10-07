const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// @route   GET /api/leaderboard
// @desc    Get leaderboard by period (weekly/monthly)
router.get('/', getLeaderboard);

module.exports = router;