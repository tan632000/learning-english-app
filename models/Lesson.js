const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema cho từ vựng để có cấu trúc rõ ràng
const vocabularySchema = new Schema({
    word: { type: String, required: true },
    meaning: { type: String, required: true },
    pronunciation: { type: String }, // e.g., /wɜːd/
    example: { type: String },
    audioUrl: { type: String }, // URL to audio file for listening
    imageUrl: { type: String }  // URL to an image for flashcards
}, { _id: false }); // Không cần _id cho từng từ vựng

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String, // Có thể dùng cho "bài đọc"
        required: true
    },
    videoUrl: {
        type: String
    },
    vocabulary: {
        type: [vocabularySchema], // Mảng các từ vựng
        default: []
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    duration: {
        type: Number, // in minutes
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
