const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    googleId: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Mật khẩu không bắt buộc nếu đăng ký bằng Google
        required: function() { return !this.googleId; }
    },
    avatarUrl: {
        type: String,
        default: '/default-avatar.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'editor'],
        default: 'user'
    },
    // --- Gamification Fields ---
    weeklyScore: {
        type: Number,
        default: 0
    },
    monthlyScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('User', userSchema);