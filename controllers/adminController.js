const adminService = require('../services/adminService');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res, next) => {
    try {
        const result = await adminService.getAllUsers(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:userId/role
 * @access  Private (Admin)
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const updatedUser = await adminService.updateUserRole(userId, role);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user's active status
 * @route   PUT /api/admin/users/:userId/status
 * @access  Private (Admin)
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive status is required.' });
        }

        const updatedUser = await adminService.updateUserStatus(userId, isActive);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};