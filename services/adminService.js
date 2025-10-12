const User = require('../models/User');
const httpError = require('http-errors');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const QuizResult = require('../models/QuizResult');
const UserProgress = require('../models/UserProgress');
const FlashcardSet = require('../models/FlashcardSet');
const Resource = require('../models/Resource');


/**
 * Retrieves a paginated list of all users.
 * @param {object} pagination - Pagination options (page, limit).
 * @returns {Promise<object>} - An object containing the list of users and pagination info.
 */
exports.getAllUsers = async (pagination = {}) => {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password') // Exclude password from the result
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments();

    return {
        users,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
        },
    };
};

/**
 * Updates the role of a specific user.
 * @param {string} userId - The ID of the user to update.
 * @param {string} newRole - The new role to assign.
 * @returns {Promise<object>} - The updated user object.
 */
exports.updateUserRole = async (userId, newRole) => {
    const allowedRoles = ['user', 'editor', 'admin'];
    if (!allowedRoles.includes(newRole)) {
        throw httpError.BadRequest('Invalid role specified.');
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw httpError.NotFound('User not found.');

    return user;
};

/**
 * Retrieves all courses for moderation.
 * @returns {Promise<Array>} - A list of all courses.
 */
exports.getAllCoursesForAdmin = async () => {
    return await Course.find({})
        .populate('author', 'username')
        .sort({ createdAt: -1 });
};

/**
 * Retrieves all lessons for moderation.
 * @returns {Promise<Array>} - A list of all lessons.
 */
exports.getAllLessonsForAdmin = async () => {
    return await Lesson.find({})
        .populate({ path: 'course', select: 'title' })
        .sort({ createdAt: -1 });
};

/**
 * Retrieves all flashcard sets for moderation.
 * @returns {Promise<Array>} - A list of all flashcard sets.
 */
exports.getAllFlashcardSetsForAdmin = async () => {
    return await FlashcardSet.find({})
        .populate('author', 'username')
        .sort({ createdAt: -1 });
};

/**
 * Retrieves all resources for moderation.
 * @returns {Promise<Array>} - A list of all resources.
 */
exports.getAllResourcesForAdmin = async () => {
    return await Resource.find({})
        .populate('author', 'username')
        .populate({ path: 'course', select: 'title' })
        .sort({ createdAt: -1 });
};

/**
 * Gathers time-series statistics for admin reports (charts).
 * @param {string} range - The time range (e.g., '7d', '30d', '90d').
 * @param {string} granularity - The data granularity ('day', 'week', 'month').
 * @returns {Promise<object>} - An object containing time-series data for different metrics.
 */
exports.getTimeSeriesStats = async (range = '30d', granularity = 'day') => {
    let days;
    switch (range) {
        case '7d': days = 7; break;
        case '90d': days = 90; break;
        default: days = 30;
    }
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let format, dateField;
    switch (granularity) {
        case 'week':
            format = '%Y-%U'; // Year-Week number
            break;
        case 'month':
            format = '%Y-%m'; // Year-Month
            break;
        default: // day
            format = '%Y-%m-%d';
            break;
    }

    const createAggregationPipeline = (collection, dateField) => [
        { $match: { [dateField]: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format, date: `$${dateField}` } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } }
    ];

    // This pipeline is for completed lessons which are in a nested array
    const completedLessonsPipeline = [
        { $match: { 'completedLessons.completedAt': { $gte: startDate } } },
        { $unwind: '$completedLessons' },
        { $match: { 'completedLessons.completedAt': { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format, date: '$completedLessons.completedAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } }
    ];

    const [newUsers, quizSubmissions, lessonsCompleted] = await Promise.all([
        User.aggregate(createAggregationPipeline(User, 'createdAt')),
        QuizResult.aggregate(createAggregationPipeline(QuizResult, 'createdAt')),
        UserProgress.aggregate(completedLessonsPipeline)
    ]);

    // Helper to merge data into a single structure
    const mergeResults = (labels, ...dataArrays) => {
        const dataMap = new Map();
        labels.forEach(label => dataMap.set(label, Array(dataArrays.length).fill(0)));

        dataArrays.forEach((dataArray, arrayIndex) => {
            dataArray.forEach(({ date, count }) => {
                if (dataMap.has(date)) {
                    dataMap.get(date)[arrayIndex] = count;
                }
            });
        });

        return Array.from(dataMap.entries()).map(([date, values]) => ({ date, values }));
    };

    // Generate all date labels for the range to ensure no gaps in the chart
    const allDates = new Set([...newUsers.map(d => d.date), ...quizSubmissions.map(d => d.date), ...lessonsCompleted.map(d => d.date)]);
    const sortedLabels = Array.from(allDates).sort();

    const chartData = mergeResults(sortedLabels, newUsers, quizSubmissions, lessonsCompleted);

    return {
        series: [
            { name: 'New Users', data: chartData.map(d => d.values[0]) },
            { name: 'Quiz Submissions', data: chartData.map(d => d.values[1]) },
            { name: 'Lessons Completed', data: chartData.map(d => d.values[2]) }
        ],
        categories: sortedLabels
    };
};

/**
 * Gathers overall statistics for the admin dashboard.
 * @returns {Promise<object>} - An object with system-wide statistics.
 */
exports.getSystemDashboardStats = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Run queries in parallel for better performance
    const [
        totalUsers,
        newUsersLast7Days,
        totalCourses,
        totalLessons,
        totalQuizSubmissions
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Course.countDocuments(),
        Lesson.countDocuments(),
        QuizResult.countDocuments()
    ]);

    return {
        users: { total: totalUsers, newLast7Days: newUsersLast7Days },
        content: { courses: totalCourses, lessons: totalLessons },
        activity: { quizSubmissions: totalQuizSubmissions }
    };
};

/**
 * Updates the active status of a specific user (activate/deactivate).
 * @param {string} userId - The ID of the user to update.
 * @param {boolean} isActive - The new active status.
 * @returns {Promise<object>} - The updated user object.
 */
exports.updateUserStatus = async (userId, isActive) => {
    if (typeof isActive !== 'boolean') {
        throw httpError.BadRequest('Active status must be a boolean.');
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { isActive: isActive },
        { new: true }
    ).select('-password');

    if (!user) {
        throw httpError.NotFound('User not found.');
    }

    return user;
};