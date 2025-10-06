const authService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const token = await authService.registerUser(req.body);
        res.status(201).json({ token });
    } catch (error) {
        // Chuyển lỗi cho middleware xử lý lỗi tập trung
        next(error);
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const token = await authService.loginUser(req.body);
        res.json({ token });
    } catch (error) {
        next(error);
    }
};
