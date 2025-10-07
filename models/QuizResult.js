const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizResultSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    // Lưu lại chi tiết câu trả lời để người dùng xem lại
    answers: [{
        questionText: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);