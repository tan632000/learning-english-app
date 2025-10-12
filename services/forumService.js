const ForumCategory = require('../models/ForumCategory');
const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const httpError = require('http-errors');
const mongoose = require('mongoose');

exports.getCategories = async () => {
    return await ForumCategory.find().sort({ order: 'asc' });
};

exports.getThreadsByCategory = async (categoryId, { page = 1, limit = 15 }) => {
    const skip = (page - 1) * limit;
    const threads = await ForumThread.find({ category: categoryId })
        .populate('author', 'username avatarUrl')
        .populate({
            path: 'lastReply',
            populate: { path: 'author', select: 'username' }
        })
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalThreads = await ForumThread.countDocuments({ category: categoryId });
    return {
        threads,
        totalPages: Math.ceil(totalThreads / limit),
        currentPage: page
    };
};

exports.getThreadWithPosts = async (threadId, { page = 1, limit = 15 }) => {
    const skip = (page - 1) * limit;
    const thread = await ForumThread.findById(threadId)
        .populate('author', 'username avatarUrl')
        .populate('category', 'title');

    if (!thread) throw httpError.NotFound('Thread not found.');

    const posts = await ForumPost.find({ thread: threadId })
        .populate('author', 'username avatarUrl role')
        .sort({ createdAt: 'asc' })
        .skip(skip)
        .limit(limit);

    const totalPosts = await ForumPost.countDocuments({ thread: threadId });

    return {
        thread,
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
    };
};

exports.createThread = async ({ title, content, categoryId, authorId }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newThread = new ForumThread({
            title,
            category: categoryId,
            author: authorId,
        });

        const initialPost = new ForumPost({
            content,
            author: authorId,
            thread: newThread._id,
        });

        newThread.lastReply = initialPost._id;

        await newThread.save({ session });
        await initialPost.save({ session });

        await session.commitTransaction();
        return newThread;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

exports.createPost = async ({ content, threadId, authorId }) => {
    const thread = await ForumThread.findById(threadId);
    if (!thread) throw httpError.NotFound('Thread not found.');
    if (thread.isLocked) throw httpError.Forbidden('This thread is locked.');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newPost = new ForumPost({
            content,
            author: authorId,
            thread: threadId,
        });

        thread.replyCount += 1;
        thread.lastReply = newPost._id;

        await newPost.save({ session });
        await thread.save({ session });

        await session.commitTransaction();
        return await newPost.populate('author', 'username avatarUrl');
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Note: Functions for updating/deleting posts/threads would be similar to the comment service.
// They would check for ownership or admin role before performing the action.
// For brevity, I'm focusing on the core creation and retrieval logic here.