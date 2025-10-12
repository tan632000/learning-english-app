const forumService = require('../services/forumService');

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await forumService.getCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getThreads = async (req, res, next) => {
    try {
        const { categoryId, page, limit } = req.query;
        if (!categoryId) return res.status(400).json({ message: 'Category ID is required.' });
        const data = await forumService.getThreadsByCategory(categoryId, { page, limit });
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getThread = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const data = await forumService.getThreadWithPosts(req.params.threadId, { page, limit });
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.createThread = async (req, res, next) => {
    try {
        const { title, content, categoryId } = req.body;
        const thread = await forumService.createThread({
            title, content, categoryId, authorId: req.user.id
        });
        res.status(201).json(thread);
    } catch (error) {
        next(error);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const { content } = req.body;
        const post = await forumService.createPost({
            content,
            threadId: req.params.threadId,
            authorId: req.user.id
        });
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};