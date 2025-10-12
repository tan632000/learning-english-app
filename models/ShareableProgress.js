const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { customAlphabet } = require('nanoid');

// Generate a short, URL-friendly unique ID (e.g., 'a8b2c1d4e6')
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const shareableProgressSchema = new Schema({
    shareId: {
        type: String,
        default: () => nanoid(),
        unique: true,
        required: true,
        index: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['course_completion'] // Có thể mở rộng sau này: 'level_up', 'achievement_unlocked'
    },
    // Tham chiếu đến đối tượng cụ thể (ví dụ: ID của khóa học)
    refId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    // Lưu trữ một số dữ liệu để hiển thị nhanh trên trang công khai
    details: {
        title: String, // Ví dụ: Tên khóa học
        userName: String,
        completionDate: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('ShareableProgress', shareableProgressSchema);