const recommendationService = require('../services/recommendationService');
const userStatsService = require('../services/userStatsService');

/**
 * @desc    Get next lesson recommendation for the current user
 * @route   GET /api/users/me/recommendation?courseId=:courseId
 * @access  Private
 */
exports.getLessonRecommendation = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const userId = req.user.id;
        const recommendation = await recommendationService.getRecommendation(userId, courseId);
        res.json(recommendation);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get learning statistics for the current user in a course
 * @route   GET /api/users/me/stats?courseId=:courseId
 * @access  Private
 */
exports.getLearningStats = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }
        const stats = await userStatsService.getStatsForCourse(req.user.id, courseId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};