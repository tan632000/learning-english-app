const UserProgress = require('../models/UserProgress');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const httpError = require('http-errors');

/**
 * Gathers overall statistics for a course dashboard for an instructor.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<object>} - An object with overall course statistics.
 */
exports.getCourseDashboardStats = async (courseId) => {
    const course = await Course.findById(courseId).lean();
    if (!course) {
        throw httpError.NotFound('Course not found');
    }

    const totalLessons = course.lessons.length;

    // 1. Get all progress records for this course
    const progresses = await UserProgress.find({ course: courseId }).lean();
    const enrolledStudents = progresses.length;

    if (enrolledStudents === 0) {
        return {
            courseTitle: course.title,
            enrolledStudents: 0,
            averageCompletion: 0,
            averageScore: 0,
        };
    }

    // 2. Calculate average completion rate
    const totalCompletion = progresses.reduce((sum, p) => {
        const completion = totalLessons > 0 ? (p.completedLessons.length / totalLessons) * 100 : 0;
        return sum + completion;
    }, 0);
    const averageCompletion = totalCompletion / enrolledStudents;

    // 3. Calculate average score
    const courseLessonIds = course.lessons.map(id => id.toString());
    const quizResults = await QuizResult.find({}).populate({
        path: 'quiz',
        select: 'lesson'
    }).lean();

    const relevantResults = quizResults.filter(result =>
        result.quiz && result.quiz.lesson && courseLessonIds.includes(result.quiz.lesson.toString())
    );

    const totalScore = relevantResults.reduce((sum, r) => sum + r.score, 0);
    const totalPossibleScore = relevantResults.reduce((sum, r) => sum + r.totalQuestions, 0);
    const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

    return {
        courseTitle: course.title,
        enrolledStudents,
        averageCompletion: parseFloat(averageCompletion.toFixed(1)),
        averageScore: parseFloat(averageScore.toFixed(1)),
    };
};

/**
 * Retrieves a list of students in a course with their individual stats.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Array>} - A list of student statistics.
 */
exports.getStudentStatsForCourse = async (courseId) => {
    const course = await Course.findById(courseId).lean();
    if (!course) throw httpError.NotFound('Course not found');

    const progresses = await UserProgress.find({ course: courseId })
        .populate('user', 'username email avatarUrl')
        .lean();

    const studentStats = progresses.map(p => {
        const completionPercentage = course.lessons.length > 0
            ? (p.completedLessons.length / course.lessons.length) * 100
            : 0;

        return {
            user: p.user,
            progressId: p._id,
            completedLessons: p.completedLessons.length,
            totalLessons: course.lessons.length,
            completionPercentage: parseFloat(completionPercentage.toFixed(1)),
            // Note: Calculating average score per student here would be very query-intensive.
            // It's better to fetch that on-demand if needed.
        };
    });

    return studentStats;
};