const resourceService = require('../services/resourceService');

exports.getResources = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required.' });
        }
        const resources = await resourceService.getResourcesByCourse(courseId);
        res.json(resources);
    } catch (error) {
        next(error);
    }
};

exports.createResource = async (req, res, next) => {
    try {
        const resource = await resourceService.createResource(req.body, req.user.id, req.user.role);
        res.status(201).json(resource);
    } catch (error) {
        next(error);
    }
};

exports.updateResource = async (req, res, next) => {
    try {
        const resource = await resourceService.updateResource(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );
        res.json(resource);
    } catch (error) {
        next(error);
    }
};

exports.deleteResource = async (req, res, next) => {
    try {
        await resourceService.deleteResource(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};