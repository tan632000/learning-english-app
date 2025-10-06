const errorHandler = (err, req, res, next) => {
    // Nếu lỗi đã có statusCode (ví dụ từ http-errors), sử dụng nó. Nếu không, mặc định là 500.
    const statusCode = err.statusCode || 500;

    console.error(err.message, err.stack);

    res.status(statusCode).json({
        message: err.message,
        // Chỉ hiển thị stack trace ở môi trường development để debug
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

module.exports = errorHandler;