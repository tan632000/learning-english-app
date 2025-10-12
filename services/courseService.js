const Course = require('../models/Course');
const httpError = require('http-errors');

/**
 * Get all published courses with filtering and pagination.
 * @param {object} filters - Query filters (e.g., { level: 'beginner' }).
 * @returns {Promise<Array>} - A list of courses.
 */
exports.getAllCourses = async (filters = {}) => {
    // Chỉ lấy các khóa học đã được xuất bản
    const query = { isPublished: true, ...filters };
    const courses = await Course.find(query).select('-lessons'); // Không cần lấy danh sách lesson ở trang danh sách
    return courses;
};

/**
 * Get a single course by its ID.
 * @param {string} courseId - The ID of the course.
 * @param {object} user - The user object from the request.
 * @returns {Promise<object>} - The course object with populated lessons.
 */
exports.getCourseById = async (courseId, user) => {
    let query = Course.findById(courseId);

    // If user is not an admin, only show published courses
    if (!user || user.role !== 'admin') {
        query = query.where('isPublished').equals(true);
    }

    const course = await query.populate({
            path: 'lessons',
            select: 'title duration' // Chỉ lấy các trường cần thiết của bài học
        });

    if (!course) {
        throw httpError.NotFound('Course not found');
    }
    return course;
};

/**
 * Create a new course.
 * @param {object} courseData - The data for the new course.
 * @param {string} authorId - The ID of the user creating the course.
 * @returns {Promise<object>} - The newly created course.
 */
exports.createCourse = async (courseData, authorId) => {
    const newCourse = await Course.create({
        ...courseData,
        author: authorId,
    });
    return newCourse;
};

/**
 * Update an existing course.
 * @param {string} courseId - The ID of the course to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user performing the update.
 * @param {string} userRole - The role of the user performing the update.
 * @returns {Promise<object>} - The updated course.
 */
exports.updateCourse = async (courseId, updateData, userId, userRole) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw httpError.NotFound('Course not found');
    }
    // Ensure only the author or an admin can update the course
    if (course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to update this course');
    }
    Object.assign(course, updateData);
    await course.save();
    return course;
};

/**
 * Delete a course.
 * @param {string} courseId - The ID of the course to delete.
 * @param {string} userId - The ID of the user performing the delete.
 * @param {string} userRole - The role of the user performing the delete.
 * @returns {Promise<void>}
 */
exports.deleteCourse = async (courseId, userId, userRole) => {
    const course = await Course.findById(courseId);
    if (!course) throw httpError.NotFound('Course not found');

    if (course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this course');
    }

    await course.deleteOne();
};