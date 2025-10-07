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

/**
 * Create a new lesson for a specific course.
 * @param {string} courseId - The ID of the course the lesson belongs to.
 * @param {object} lessonData - The data for the new lesson.
 * @param {string} userId - The ID of the user creating the lesson.
 * @param {string} userRole - The role of the user creating the lesson.
 * @returns {Promise<object>} - The newly created lesson.
 */
exports.createLesson = async (courseId, lessonData, userId, userRole) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw httpError.NotFound('Course not found');
    }
    // Ensure only the author of the course or an admin can add lessons to the course
    if (course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to add lessons to this course');
    }

    const newLesson = await Lesson.create({ ...lessonData, course: courseId });
    course.lessons.push(newLesson._id);
    await course.save();
    return newLesson;
};

/**
 * Update an existing lesson.
 * @param {string} lessonId - The ID of the lesson to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user performing the update.
 * @param {string} userRole - The role of the user performing the update.
 * @returns {Promise<object>} - The updated lesson.
 */
exports.updateLesson = async (lessonId, updateData, userId, userRole) => {
    const lesson = await Lesson.findById(lessonId).populate('course', 'author');
    if (!lesson) throw httpError.NotFound('Lesson not found');

    if (lesson.course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to update this lesson');
    }

    Object.assign(lesson, updateData);
    await lesson.save();
    return lesson;
};

/**
 * Delete a lesson.
 * @param {string} lessonId - The ID of the lesson to delete.
 * @param {string} userId - The ID of the user performing the delete.
 * @param {string} userRole - The role of the user performing the delete.
 * @returns {Promise<void>}
 */
exports.deleteLesson = async (lessonId, userId, userRole) => {
    const lesson = await Lesson.findById(lessonId).populate('course', 'author');
    if (!lesson) throw httpError.NotFound('Lesson not found');

    if (lesson.course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this lesson');
    }

    // Remove lesson ID from the course's lessons array
    await Course.findByIdAndUpdate(lesson.course._id, { $pull: { lessons: lessonId } });

    await lesson.deleteOne();
};