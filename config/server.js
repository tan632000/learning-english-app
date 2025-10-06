// backend/server.js
const express = require('express');
const passport = require('passport');
const cors = require('cors');
// Load biến môi trường LÊN ĐẦU TIÊN
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Kết nối tới Database
connectDB();

const app = express();

// Middleware
app.use(cors());
// Cấu hình Passport sau khi đã có biến môi trường
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(express.json());

// API route để kiểm tra
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the Backend API!' });
});

// Mount Routers
app.use('/api/auth', require('./routes/auth'));

// Sử dụng Error Handler Middleware (phải đặt ở cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
