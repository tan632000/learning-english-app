const cron = require('node-cron');
const Quiz = require('../models/Quiz');
const DailyChallenge = require('../models/DailyChallenge');

const CHALLENGE_SIZE = 5; // 5 câu hỏi mỗi ngày

const scheduleChallengeGeneration = () => {
    // Chạy vào 00:01 mỗi ngày
    cron.schedule('1 0 * * *', async () => {
        console.log('[CRON] Generating new daily challenge...');
        try {
            // 1. Lấy tất cả câu hỏi từ các quiz đã có
            const quizzes = await Quiz.find({}).select('questions').lean();
            if (quizzes.length === 0) {
                console.log('[CRON] No quizzes found to generate a challenge.');
                return;
            }

            const allQuestions = quizzes.flatMap(quiz => quiz.questions);

            if (allQuestions.length < CHALLENGE_SIZE) {
                console.log('[CRON] Not enough questions in the question bank.');
                return;
            }

            // 2. Lấy ngẫu nhiên 5 câu hỏi
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, CHALLENGE_SIZE);

            // 3. Tạo challenge cho ngày hôm nay
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await DailyChallenge.findOneAndUpdate(
                { date: today },
                { questions: selectedQuestions },
                { upsert: true, new: true }
            );

            console.log('[CRON] Daily challenge for today has been generated successfully.');

        } catch (error) {
            console.error('[CRON] Error generating daily challenge:', error);
        }
    }, {
        timezone: "Asia/Ho_Chi_Minh"
    });
};

module.exports = { scheduleChallengeGeneration };