const ShareableProgress = require('../models/ShareableProgress');
const Course = require('../models/Course');
const User = require('../models/User');
const httpError = require('http-errors');

/**
 * Creates a shareable link for a course completion.
 * @param {string} userId - The ID of the user.
 * @param {string} courseId - The ID of the completed course.
 * @returns {Promise<object>} - The shareable progress object.
 */
exports.createShareableLink = async (userId, courseId) => {
    // Check if a shareable link already exists for this user and course
    const existingShare = await ShareableProgress.findOne({ user: userId, refId: courseId, type: 'course_completion' });
    if (existingShare) {
        return existingShare;
    }

    const [user, course] = await Promise.all([
        User.findById(userId).select('username').lean(),
        Course.findById(courseId).select('title').lean()
    ]);

    if (!user || !course) {
        throw httpError.NotFound('User or Course not found.');
    }

    const newShare = await ShareableProgress.create({
        user: userId,
        refId: courseId,
        type: 'course_completion',
        details: {
            userName: user.username,
            title: course.title,
            completionDate: new Date(),
        }
    });

    return newShare;
};

/**
 * Retrieves the details of a shared progress for public display.
 * @param {string} shareId - The unique shareable ID.
 * @returns {Promise<object>} - The shareable progress details.
 */
exports.getSharedProgress = async (shareId) => {
    const sharedProgress = await ShareableProgress.findOne({ shareId }).lean();

    if (!sharedProgress) {
        throw httpError.NotFound('This achievement could not be found.');
    }

    return sharedProgress;
};