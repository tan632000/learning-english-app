// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { scheduleDailyReminders } = require('./jobs/reminderJob');
const { scheduleScoreResets } = require('./jobs/leaderboardJob');
const { scheduleChallengeGeneration } = require('./jobs/challengeGeneratorJob');

// Kết nối tới Database
connectDB();

const app = express();

// Middleware
app.use(cors());
// Cấu hình Passport sau khi đã có biến môi trường
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API route để kiểm tra
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the Backend API!' });
});

// Mount Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wordbook', require('./routes/wordbook'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/instructor', require('./routes/instructor'));

// Sử dụng Error Handler Middleware (phải đặt ở cuối cùng)
app.use(errorHandler);

// Khởi động các job đã lập lịch
scheduleDailyReminders();
scheduleScoreResets();
scheduleChallengeGeneration();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
