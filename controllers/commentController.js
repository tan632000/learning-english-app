const commentService = require('../services/commentService');

exports.getComments = async (req, res, next) => {
    try {
        const { lessonId } = req.query;
        if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required.' });
        const comments = await commentService.getCommentsByLesson(lessonId);
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const { lessonId, content, parentId } = req.body;
        const comment = await commentService.addComment({
            lessonId,
            content,
            parentId,
            userId: req.user.id
        });
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

exports.updateComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const comment = await commentService.updateComment(req.params.id, req.user.id, content);
        res.json(comment);
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        await commentService.deleteComment(req.params.id, req.user.id, req.user.role);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.toggleLike = async (req, res, next) => {
    try {
        const comment = await commentService.toggleLikeComment(req.params.id, req.user.id);
        res.json({
            commentId: comment._id,
            likes: comment.likes.length
        });
    } catch (error) {
        next(error);
    }
};