const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a learning reminder email.
 * @param {string} to - Recipient's email address.
 * @param {object} data - Data for the email template.
 * @param {string} data.username - The user's name.
 * @param {number} data.reviewCount - Number of words to review.
 */
const sendReminderEmail = async (to, data) => {
    const subject = '🔔 Your Daily English Learning Reminder!';
    const html = `
        <h2>Hi ${data.username},</h2>
        <p>It's time for your daily English practice!</p>
        <p>You have <strong>${data.reviewCount}</strong> words waiting for you to review in your wordbook.</p>
        <p>Keep up the great work!</p>
        <br>
        <p>The English Learning App Team</p>
    `;

    await transporter.sendMail({ from: `"English Learning App" <${process.env.EMAIL_USER}>`, to, subject, html });
};

module.exports = { sendReminderEmail };