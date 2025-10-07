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

exports.createLesson = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const lesson = await lessonService.createLesson(courseId, req.body, req.user.id, req.user.role);
        res.status(201).json(lesson);
    } catch (error) {
        next(error);
    }
};

exports.updateLesson = async (req, res, next) => {
    try {
        const lesson = await lessonService.updateLesson(req.params.id, req.body, req.user.id, req.user.role);
        res.json(lesson);
    } catch (error) {
        next(error);
    }
};

exports.deleteLesson = async (req, res, next) => {
    try {
        await lessonService.deleteLesson(req.params.id, req.user.id, req.user.role);
        res.status(204).json({ message: 'Lesson removed' });
    } catch (error) {
        next(error);
    }
};
