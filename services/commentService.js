const Comment = require('../models/Comment');
const httpError = require('http-errors');

/**
 * Get all comments for a lesson, structured in a nested format.
 * @param {string} lessonId - The ID of the lesson.
 * @returns {Promise<Array>} - A list of top-level comments, each with a 'replies' array.
 */
exports.getCommentsByLesson = async (lessonId) => {
    const comments = await Comment.find({ lesson: lessonId })
        .populate('user', 'username avatarUrl')
        .sort({ createdAt: 'asc' })
        .lean();

    // Build a nested structure
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment._id] = comment;
        if (comment.parent) {
            if (commentMap[comment.parent]) {
                commentMap[comment.parent].replies.push(comment);
            }
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
};

/**
 * Add a new comment to a lesson.
 * @param {object} commentData - { lessonId, userId, content, parentId }.
 * @returns {Promise<object>} - The newly created comment.
 */
exports.addComment = async ({ lessonId, userId, content, parentId = null }) => {
    const newComment = await Comment.create({
        lesson: lessonId,
        user: userId,
        content,
        parent: parentId
    });
    return await newComment.populate('user', 'username avatarUrl');
};

/**
 * Update an existing comment.
 * @param {string} commentId - The ID of the comment to update.
 * @param {string} userId - The ID of the user performing the update.
 * @param {string} content - The new content.
 * @returns {Promise<object>} - The updated comment.
 */
exports.updateComment = async (commentId, userId, content) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw httpError.NotFound('Comment not found.');

    if (comment.user.toString() !== userId) {
        throw httpError.Forbidden('Not authorized to update this comment.');
    }

    comment.content = content;
    await comment.save();
    return await comment.populate('user', 'username avatarUrl');
};

/**
 * Delete a comment.
 * @param {string} commentId - The ID of the comment to delete.
 * @param {string} userId - The ID of the user performing the delete.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<void>}
 */
exports.deleteComment = async (commentId, userId, userRole) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw httpError.NotFound('Comment not found.');

    if (comment.user.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this comment.');
    }

    // Also delete all replies to this comment
    await Comment.deleteMany({ parent: commentId });
    await comment.deleteOne();
};

/**
 * Like or unlike a comment.
 * @param {string} commentId - The ID of the comment.
 * @param {string} userId - The ID of the user liking/unliking.
 * @returns {Promise<object>} - The updated comment with new like count.
 */
exports.toggleLikeComment = async (commentId, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw httpError.NotFound('Comment not found.');

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1); // Unlike
    } else {
        comment.likes.push(userId); // Like
    }

    await comment.save();
    return comment;
};