const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyChallengeResultSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: Schema.Types.ObjectId,
        ref: 'DailyChallenge',
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
    answers: [{
        questionText: String,
        selectedAnswer: String,
        isCorrect: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('DailyChallengeResult', dailyChallengeResultSchema);