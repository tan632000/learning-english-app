const cron = require('node-cron');
const User = require('../models/User');
const WordbookEntry = require('../models/WordbookEntry');
const { sendReminderEmail } = require('../utils/mailer');

/**
 * This job runs every day at 8:00 AM.
 * It finds users who have words to review and sends them a reminder email.
 */
const scheduleDailyReminders = () => {
    // Runs at 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Running daily reminder job...');

        try {
            // Find users who have notifications enabled (assuming a setting exists)
            // For now, we'll just get all users.
            const users = await User.find({}).select('email username').lean();

            for (const user of users) {
                // Find how many words are due for review for this user
                const reviewCount = await WordbookEntry.countDocuments({
                    user: user._id,
                    nextReviewDate: { $lte: new Date() }
                });

                if (reviewCount > 0) {
                    console.log(`[CRON] Sending reminder to ${user.email} for ${reviewCount} words.`);
                    await sendReminderEmail(user.email, { username: user.username, reviewCount });
                }
            }
        } catch (error) {
            console.error('[CRON] Error in daily reminder job:', error);
        }
    }, {
        timezone: "Asia/Ho_Chi_Minh" // Set to your target timezone
    });
};

module.exports = { scheduleDailyReminders };