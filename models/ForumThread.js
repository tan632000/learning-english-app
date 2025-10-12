const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumThreadSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ForumCategory',
        required: true
    },
    isLocked: { // Admin can lock threads
        type: Boolean,
        default: false
    },
    isPinned: { // Admin can pin threads
        type: Boolean,
        default: false
    },
    replyCount: { type: Number, default: 0 },
    lastReply: { type: Schema.Types.ObjectId, ref: 'ForumPost' }
}, { timestamps: true });

module.exports = mongoose.model('ForumThread', forumThreadSchema);