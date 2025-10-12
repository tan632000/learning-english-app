const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumCategorySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    order: { // For sorting categories
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ForumCategory', forumCategorySchema);