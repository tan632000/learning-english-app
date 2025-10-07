const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProgressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completedLessons: [{
        lesson: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Đảm bảo một user chỉ có một bản ghi progress cho mỗi khóa học
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
