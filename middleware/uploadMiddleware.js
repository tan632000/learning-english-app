const multer = require('multer');
const path = require('path');
const httpError = require('http-errors');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // File sẽ được lưu vào thư mục 'public/uploads'
        // Thư mục này cần được tạo trong folder `backend`
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Tạo một tên file duy nhất để tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc để chỉ chấp nhận các loại file nhất định
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(httpError.BadRequest('Error: File type not allowed!'));
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50 // Giới hạn kích thước file: 50MB
    },
    fileFilter: fileFilter
});

module.exports = upload;