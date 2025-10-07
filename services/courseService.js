const Course = require('../models/Course');
const httpError = require('http-errors');

/**
 * Get all published courses with filtering.
 * @param {object} filters - Query filters (e.g., { level: 'beginner' }).
 * @returns {Promise<Array>} - A list of courses.
 */
exports.getAllCourses = async (filters = {}) => {
    // Chỉ lấy các khóa học đã được xuất bản
    const query = { isPublished: true, ...filters };
    // Không cần lấy danh sách lessons chi tiết ở trang danh sách tổng
    const courses = await Course.find(query).select('-lessons'); 
    return courses;
};

/**
 * Get a single course by its ID.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<object>} - The course object with populated lessons.
 */
exports.getCourseById = async (courseId) => {
    const course = await Course.findById(courseId)
        .where('isPublished').equals(true)
        .populate({
            path: 'lessons',
            select: 'title duration' // Chỉ lấy các trường cần thiết của bài học để hiển thị danh sách
        });

    if (!course) {
        throw httpError.NotFound('Course not found');
    }
    return course;
};
