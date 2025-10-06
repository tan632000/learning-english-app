// models/Lesson.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    // Nội dung bài học, có thể là HTML/Markdown
    content: {
        type: String,
        required: true
    },
    // Video cho bài học (nếu có)
    videoUrl: {
        type: String
    },
    // Thuộc về khóa học nào
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Bài kiểm tra cuối bài học (nếu có)
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    // Thời lượng ước tính (phút)
    duration: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
