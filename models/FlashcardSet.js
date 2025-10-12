const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho một thẻ flashcard đơn lẻ
const flashcardSchema = new Schema({
    front: {
        type: String,
        required: true,
        trim: true
    },
    back: {
        type: String,
        required: true
    },
    imageUrl: { // URL hình ảnh minh họa (tùy chọn)
        type: String
    }
}, { _id: true });

const flashcardSetSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    flashcards: [flashcardSchema]
}, { timestamps: true });

module.exports = mongoose.model('FlashcardSet', flashcardSetSchema);