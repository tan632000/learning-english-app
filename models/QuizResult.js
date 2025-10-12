const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    questionId: { type: Schema.Types.ObjectId, required: true },
    questionText: String,
    studentAnswer: String, // Text answer or file URL
    isCorrect: { type: Boolean, default: null }, // null for manually graded questions initially
    status: { type: String, enum: ['auto-graded', 'pending-review', 'graded'], required: true },
    instructorFeedback: { type: String, default: '' },
    score: { type: Number, default: 0 } // Score given for this answer
});

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
    }, // Total auto-graded score initially, updated after manual grading
    totalQuestions: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending-review'],
        default: 'completed'
    },
    answers: [answerSchema]
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);