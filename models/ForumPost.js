const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumPostSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'ForumThread',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);