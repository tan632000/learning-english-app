const lessonService = require('../services/lessonService');

/**
 * @desc    Get a single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Private (Cần đăng nhập)
 */
exports.getLessonById = async (req, res, next) => {
    try {
        const lesson = await lessonService.getLessonById(req.params.id);
        res.json(lesson);
    } catch (error) {
        next(error);
    }
};
