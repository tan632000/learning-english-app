const adminService = require('../services/adminService');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res, next) => {
    try {
        const result = await adminService.getAllUsers(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:userId/role
 * @access  Private (Admin)
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const updatedUser = await adminService.updateUserRole(userId, role);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user's active status
 * @route   PUT /api/admin/users/:userId/status
 * @access  Private (Admin)
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive status is required.' });
        }

        const updatedUser = await adminService.updateUserStatus(userId, isActive);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get system-wide dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminService.getSystemDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get time-series statistics for reports/charts
 * @route   GET /api/admin/reports/timeseries
 * @access  Private (Admin)
 */
exports.getTimeSeriesStats = async (req, res, next) => {
    try {
        const { range, granularity } = req.query;
        const stats = await adminService.getTimeSeriesStats(range, granularity);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all courses for moderation
 * @route   GET /api/admin/content/courses
 * @access  Private (Admin)
 */
exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await adminService.getAllCoursesForAdmin();
        res.json(courses);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all lessons for moderation
 * @route   GET /api/admin/content/lessons
 * @access  Private (Admin)
 */
exports.getAllLessons = async (req, res, next) => {
    try {
        const lessons = await adminService.getAllLessonsForAdmin();
        res.json(lessons);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all flashcard sets for moderation
 * @route   GET /api/admin/content/flashcard-sets
 * @access  Private (Admin)
 */
exports.getAllFlashcardSets = async (req, res, next) => {
    try {
        const sets = await adminService.getAllFlashcardSetsForAdmin();
        res.json(sets);
    } catch (error) {
        next(error);
    }
};