const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sử dụng lại cấu trúc của questionSchema từ Quiz
const questionSchema = new Schema({
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true }
}, { _id: false });

const dailyChallengeSchema = new Schema({
    date: {
        type: Date,
        required: true,
        unique: true // Mỗi ngày chỉ có một challenge
    },
    questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);