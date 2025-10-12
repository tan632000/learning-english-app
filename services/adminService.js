const User = require('../models/User');
const httpError = require('http-errors');

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