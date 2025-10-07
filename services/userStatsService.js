const Course = require('../models/Course');
const UserProgress = require('../models/UserProgress');
const QuizResult = require('../models/QuizResult');
const Lesson = require('../models/Lesson');
const httpError = require('http-errors');

/**
 * Gathers and calculates learning statistics for a user in a specific course.
 * @param {string} userId - The ID of the user.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<object>} - An object containing the user's statistics.
 */
exports.getStatsForCourse = async (userId, courseId) => {
    // 1. Lấy dữ liệu cần thiết song song để tối ưu hiệu suất
    const [course, userProgress, quizResults] = await Promise.all([
        Course.findById(courseId).lean(),
        UserProgress.findOne({ user: userId, course: courseId }).lean(),
        QuizResult.find({ user: userId }).populate({
            path: 'quiz',
            select: 'lesson',
            populate: {
                path: 'lesson',
                select: 'course'
            }
        }).lean()
    ]);

    if (!course) {
        throw httpError.NotFound('Course not found');
    }

    // --- 2. Tính toán các chỉ số ---

    // a. Tỷ lệ hoàn thành khóa học (%)
    const totalLessons = course.lessons.length;
    const completedLessonsCount = userProgress ? userProgress.completedLessons.length : 0;
    const completionPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

    // b. Điểm trung bình các bài quiz trong khóa học
    const courseLessonIds = new Set(course.lessons.map(id => id.toString()));
    const relevantResults = quizResults.filter(result =>
        result.quiz && result.quiz.lesson && courseLessonIds.has(result.quiz.lesson._id.toString())
    );

    let totalScore = 0;
    let totalPossibleScore = 0;
    relevantResults.forEach(result => {
        totalScore += result.score;
        totalPossibleScore += result.totalQuestions;
    });
    const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

    // c. Tổng số từ vựng đã học trong các bài đã hoàn thành
    let wordsLearned = 0;
    if (completedLessonsCount > 0) {
        const completedLessonIds = userProgress.completedLessons.map(l => l.lesson);
        const completedLessonsData = await Lesson.find({
            _id: { $in: completedLessonIds }
        }).select('vocabulary').lean();

        wordsLearned = completedLessonsData.reduce((sum, lesson) => sum + (lesson.vocabulary ? lesson.vocabulary.length : 0), 0);
    }

    return {
        courseTitle: course.title,
        completionPercentage: parseFloat(completionPercentage.toFixed(1)),
        averageScore: parseFloat(averageScore.toFixed(1)),
        wordsLearned,
        completedLessons: completedLessonsCount,
        totalLessons,
    };
};