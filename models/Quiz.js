const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema cho từng câu hỏi
const questionSchema = new Schema({
    type: {
        type: String,
        enum: ['multiple-choice', 'essay', 'upload'],
        default: 'multiple-choice',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: { type: [String] }, // Not required for essay/upload
    correctAnswer: { type: String }, // Not required for essay/upload
    points: { type: Number, default: 1 } // Points for this question
}, { _id: false });

const quizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
        unique: true // Mỗi bài học chỉ nên có một bài quiz
    },
    questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);