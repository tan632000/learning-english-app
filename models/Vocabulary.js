// models/Vocabulary.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vocabularySchema = new Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Loại từ: noun, verb, adjective...
    type: {
        type: String,
        required: true
    },
    // Phiên âm
    pronunciation: {
        type: String
    },
    // Link file audio phát âm
    audioUrl: {
        type: String
    },
    // Định nghĩa
    meaning: {
        type: String,
        required: true
    },
    // Ví dụ
    example: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vocabulary', vocabularySchema);
