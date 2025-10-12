const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    // For nested comments (replies)
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);