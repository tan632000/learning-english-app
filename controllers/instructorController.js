const instructorService = require('../services/instructorService');

/**
 * @desc    Get overall statistics for a course dashboard
 * @route   GET /api/instructor/courses/:courseId/stats
 * @access  Private (Admin/Editor)
 */
exports.getCourseDashboardStats = async (req, res, next) => {
    try {
        const stats = await instructorService.getCourseDashboardStats(req.params.courseId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a list of students and their progress in a course
 * @route   GET /api/instructor/courses/:courseId/students
 * @access  Private (Admin/Editor)
 */
exports.getStudentStatsForCourse = async (req, res, next) => {
    try {
        const students = await instructorService.getStudentStatsForCourse(req.params.courseId);
        res.json(students);
    } catch (error) {
        next(error);
    }
};