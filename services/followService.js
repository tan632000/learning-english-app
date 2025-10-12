const User = require('../models/User');
const Course = require('../models/Course');
const UserProgress = require('../models/UserProgress');
const httpError = require('http-errors');

/**
 * Follow an instructor.
 * @param {string} userIdToFollow - The ID of the instructor to follow.
 * @param {string} followerId - The ID of the user who is following.
 * @returns {Promise<void>}
 */
exports.followInstructor = async (userIdToFollow, followerId) => {
    if (userIdToFollow === followerId) {
        throw httpError.BadRequest("You cannot follow yourself.");
    }

    const instructor = await User.findById(userIdToFollow);
    if (!instructor || !['admin', 'editor'].includes(instructor.role)) {
        throw httpError.NotFound("Instructor not found.");
    }

    // Use Promise.all to run updates in parallel
    await Promise.all([
        // Add instructor to the user's following list
        User.findByIdAndUpdate(followerId, { $addToSet: { following: userIdToFollow } }),
        // Add user to the instructor's followers list
        User.findByIdAndUpdate(userIdToFollow, { $addToSet: { followers: followerId } })
    ]);
};

/**
 * Unfollow an instructor.
 * @param {string} userIdToUnfollow - The ID of the instructor to unfollow.
 * @param {string} followerId - The ID of the user who is unfollowing.
 * @returns {Promise<void>}
 */
exports.unfollowInstructor = async (userIdToUnfollow, followerId) => {
    await Promise.all([
        // Remove instructor from the user's following list
        User.findByIdAndUpdate(followerId, { $pull: { following: userIdToUnfollow } }),
        // Remove user from the instructor's followers list
        User.findByIdAndUpdate(userIdToUnfollow, { $pull: { followers: followerId } })
    ]);
};

/**
 * Get suggested courses from followed instructors.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - A list of suggested courses.
 */
exports.getSuggestedCourses = async (userId) => {
    // 1. Find the user and their followed instructors
    const user = await User.findById(userId).select('following').lean();
    if (!user || user.following.length === 0) {
        return []; // Return empty if user is not following anyone
    }

    const followedInstructorIds = user.following;

    // 2. Find courses the user has already enrolled in
    const userProgress = await UserProgress.find({ user: userId }).select('course').lean();
    const enrolledCourseIds = userProgress.map(p => p.course);

    // 3. Find published courses from followed instructors, excluding enrolled ones
    const suggestedCourses = await Course.find({
        author: { $in: followedInstructorIds },
        isPublished: true,
        _id: { $nin: enrolledCourseIds } // Exclude courses user is already in
    })
    .populate('author', 'username avatarUrl')
    .select('-lessons')
    .limit(10) // Limit the number of suggestions
    .sort({ createdAt: -1 });

    return suggestedCourses;
};