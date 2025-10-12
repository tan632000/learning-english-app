const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['video', 'link', 'pdf', 'article'] // Các loại tài liệu
    },
    url: {
        type: String,
        required: [true, 'Please add a URL']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Liên kết tài liệu với một khóa học
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);