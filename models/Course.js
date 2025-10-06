// models/Course.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    // Tham chiếu đến người tạo khóa học (nếu có)
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Danh sách các bài học trong khóa học này (sử dụng tham chiếu)
    lessons: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
