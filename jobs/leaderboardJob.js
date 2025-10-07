const cron = require('node-cron');
const User = require('../models/User');

const scheduleScoreResets = () => {
    // Reset weekly scores every Monday at 00:00
    cron.schedule('0 0 * * 1', async () => {
        console.log('[CRON] Resetting weekly scores...');
        try {
            await User.updateMany({}, { $set: { weeklyScore: 0 } });
            console.log('[CRON] Weekly scores have been reset.');
        } catch (error) {
            console.error('[CRON] Error resetting weekly scores:', error);
        }
    }, { timezone: "Asia/Ho_Chi_Minh" });

    // Reset monthly scores on the 1st of every month at 00:00
    cron.schedule('0 0 1 * *', async () => {
        console.log('[CRON] Resetting monthly scores...');
        try {
            await User.updateMany({}, { $set: { monthlyScore: 0 } });
            console.log('[CRON] Monthly scores have been reset.');
        } catch (error) {
            console.error('[CRON] Error resetting monthly scores:', error);
        }
    }, { timezone: "Asia/Ho_Chi_Minh" });
};

module.exports = { scheduleScoreResets };