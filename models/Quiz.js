// models/Quiz.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    questionText: { type: String, required: true },
    // Mảng các lựa chọn
    options: [{ type: String, required: true }],
    // Vị trí (index) của đáp án đúng trong mảng options
    correctAnswerIndex: { type: Number, required: true }
});

const quizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    // Lồng ghép danh sách câu hỏi
    questions: [questionSchema],
    // Bài quiz này thuộc về bài học nào (để tiện truy vấn ngược)
    lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
