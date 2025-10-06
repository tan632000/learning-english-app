// models/UserProgress.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProgressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Danh sách các khóa học đã đăng ký
    enrolledCourses: [{
        course: { type: Schema.Types.ObjectId, ref: 'Course' },
        enrolledAt: { type: Date, default: Date.now }
    }],
    // Danh sách các bài học đã hoàn thành
    completedLessons: [{
        lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        completedAt: { type: Date, default: Date.now }
    }],
    // Lịch sử làm bài quiz
    quizResults: [{
        quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        score: { type: Number, required: true }, // Điểm số đạt được
        total: { type: Number, required: true }, // Tổng số câu hỏi
        submittedAt: { type: Date, default: Date.now }
    }]
});

// Tạo index để đảm bảo mỗi user chỉ có một document progress
userProgressSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
