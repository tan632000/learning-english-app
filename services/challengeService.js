const DailyChallenge = require('../models/DailyChallenge');
const DailyChallengeResult = require('../models/DailyChallengeResult');
const User = require('../models/User');
const httpError = require('http-errors');

/**
 * Gets today's challenge for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} - The challenge and user's completion status.
 */
exports.getTodaysChallenge = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({ date: today }).lean();
    if (!challenge) {
        throw httpError.NotFound("Today's challenge is not available yet. Please check back later.");
    }

    // Kiểm tra xem user đã làm bài này chưa
    const result = await DailyChallengeResult.findOne({ user: userId, challenge: challenge._id }).lean();

    // Không gửi đáp án đúng cho người dùng
    const questionsForStudent = challenge.questions.map(({ correctAnswer, ...rest }) => rest);

    return {
        challenge: { ...challenge, questions: questionsForStudent },
        result: result // Sẽ là null nếu chưa làm
    };
};

/**
 * Submits answers for today's challenge.
 * @param {string} userId - The ID of the user.
 * @param {Array<object>} userAnswers - The user's answers.
 * @returns {Promise<object>} - The saved challenge result.
 */
exports.submitChallenge = async (userId, userAnswers) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({ date: today });
    if (!challenge) {
        throw httpError.NotFound("Today's challenge is not available.");
    }

    // Ngăn người dùng nộp lại
    const existingResult = await DailyChallengeResult.findOne({ user: userId, challenge: challenge._id });
    if (existingResult) {
        throw httpError.Conflict('You have already completed today\'s challenge.');
    }

    let score = 0;
    const detailedAnswers = [];

    challenge.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer.answer === question.correctAnswer;
        if (isCorrect) score++;
        detailedAnswers.push({
            questionText: question.questionText,
            selectedAnswer: userAnswer.answer,
            isCorrect,
        });
    });

    // Cộng điểm thưởng vào leaderboard
    if (score > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { weeklyScore: score, monthlyScore: score } });
    }

    const result = await DailyChallengeResult.create({
        user: userId,
        challenge: challenge._id,
        score,
        totalQuestions: challenge.questions.length,
        answers: detailedAnswers,
    });

    return result;
};