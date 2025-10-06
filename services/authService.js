const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpError = require('http-errors');

/**
 * Creates a new user account.
 * @param {object} userData - The user data (username, email, password).
 * @returns {Promise<string>} - The JWT token.
 */
exports.registerUser = async (userData) => {
    const { username, email, password } = userData;

    // 1. Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new httpError.Conflict('User already exists');
    }

    // 2. Tạo user mới và mã hóa mật khẩu
    const user = new User({ username, email });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // 3. Tạo và trả về JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return token;
};

/**
 * Logs in a user.
 * @param {object} credentials - The user credentials (email, password).
 * @returns {Promise<string>} - The JWT token.
 */
exports.loginUser = async (credentials) => {
    const { email, password } = credentials;

    // 1. Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
        throw new httpError.Unauthorized('Invalid credentials');
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new httpError.Unauthorized('Invalid credentials');
    }

    // 3. Tạo và trả về JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return token;
};
