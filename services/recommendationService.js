const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course');
const httpError = require('http-errors');

/**
 * Suggests the next lesson for a user based on their progress.
 * @param {string} userId - The ID of the user.
 * @param {string} courseId - The ID of the current course.
 * @returns {Promise<object|null>} - The suggested lesson object or null if finished.
 */
exports.getRecommendation = async (userId, courseId) => {
    // 1. Lấy toàn bộ thông tin của khóa học, bao gồm danh sách các bài học theo thứ tự
    const course = await Course.findById(courseId).populate('lessons', '_id');
    if (!course) {
        throw httpError.NotFound('Course not found');
    }

    // 2. Lấy tiến độ của người dùng trong khóa học đó
    const progress = await UserProgress.findOne({ user: userId, course: courseId });

    const allLessonIds = course.lessons.map(lesson => lesson._id.toString());

    // Nếu người dùng chưa học bài nào, gợi ý bài đầu tiên
    if (!progress || progress.completedLessons.length === 0) {
        return { nextLessonId: allLessonIds[0] };
    }

    const completedLessonIds = new Set(progress.completedLessons.map(p => p.lesson.toString()));

    // 3. Tìm bài học đầu tiên trong danh sách mà người dùng chưa hoàn thành
    for (const lessonId of allLessonIds) {
        if (!completedLessonIds.has(lessonId)) {
            // Đây là bài học tiếp theo
            return { nextLessonId: lessonId };
        }
    }

    // 4. Nếu tất cả đã hoàn thành, không gợi ý gì thêm
    return {
        message: "Congratulations! You have completed this course.",
        nextLessonId: null
    };
};
