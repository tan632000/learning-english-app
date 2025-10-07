const jwt = require('jsonwebtoken');
const httpError = require('http-errors');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // 2. Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Lấy thông tin người dùng từ token và gắn vào request (loại bỏ password)
            req.user = await User.findById(decoded.user.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return next(httpError.Unauthorized('Not authorized, token failed'));
        }
    }

    if (!token) {
        return next(httpError.Unauthorized('Not authorized, no token'));
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return next(httpError.Forbidden('Not authorized to access this resource'));
        }
        next();
    };
};

module.exports = { protect, authorize };