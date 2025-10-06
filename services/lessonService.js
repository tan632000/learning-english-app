const Lesson = require('../models/Lesson');
const httpError = require('http-errors');

/**
 * Get a single lesson by its ID.
 * @param {string} lessonId - The ID of the lesson.
 * @returns {Promise<object>} - The lesson object.
 */
exports.getLessonById = async (lessonId) => {
    // Populate thông tin của khóa học chứa bài học này
    const lesson = await Lesson.findById(lessonId).populate('course', 'title');

    if (!lesson) {
        throw httpError.NotFound('Lesson not found');
    }

    return lesson;
};
