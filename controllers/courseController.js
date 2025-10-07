const courseService = require('../services/courseService');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
exports.getCourses = async (req, res, next) => {
    try {
        // Lấy bộ lọc từ query string, ví dụ: /api/courses?level=beginner
        const filters = req.query;
        const courses = await courseService.getAllCourses(filters);
        res.json(courses);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single course by ID
 * @route   GET /api/courses/:id
 * @access  Private (Cần đăng nhập)
 */
exports.getCourseById = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        res.json(course);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Admin/Editor)
 */
exports.createCourse = async (req, res, next) => {
    try {
        const course = await courseService.createCourse(req.body, req.user.id);
        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an existing course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin/Editor or Course Author)
 */
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body, req.user.id, req.user.role);
        res.json(course);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin/Editor or Course Author)
 */
exports.deleteCourse = async (req, res, next) => {
    try {
        await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
        res.status(204).json({ message: 'Course removed' });
    } catch (error) {
        next(error);
    }
};