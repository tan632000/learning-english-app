const followService = require('../services/followService');

exports.follow = async (req, res, next) => {
    try {
        await followService.followInstructor(req.params.id, req.user.id);
        res.status(200).json({ message: 'Successfully followed instructor.' });
    } catch (error) {
        next(error);
    }
};

exports.unfollow = async (req, res, next) => {
    try {
        await followService.unfollowInstructor(req.params.id, req.user.id);
        res.status(200).json({ message: 'Successfully unfollowed instructor.' });
    } catch (error) {
        next(error);
    }
};

exports.getSuggestions = async (req, res, next) => {
    try {
        const courses = await followService.getSuggestedCourses(req.user.id);
        res.json(courses);
    } catch (error) {
        next(error);
    }
};