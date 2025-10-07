const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema cho từng câu hỏi
const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [arr => arr.length >= 2, 'A question must have at least 2 options.']
    },
    correctAnswer: {
        type: String,
        required: true
    }
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