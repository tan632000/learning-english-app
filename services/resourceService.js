const Resource = require('../models/Resource');
const Course = require('../models/Course');
const httpError = require('http-errors');

/**
 * Get all published resources for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Array>} - A list of resources.
 */
exports.getResourcesByCourse = async (courseId) => {
    return await Resource.find({ course: courseId, isPublished: true })
        .populate('author', 'username')
        .sort({ createdAt: -1 });
};

/**
 * Create a new resource.
 * @param {object} resourceData - The data for the new resource.
 * @param {string} authorId - The ID of the author.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<object>} - The newly created resource.
 */
exports.createResource = async (resourceData, authorId, userRole) => {
    const course = await Course.findById(resourceData.course);
    if (!course) {
        throw httpError.NotFound('Course not found.');
    }

    // Authorize: only course author or admin can add resources
    if (course.author.toString() !== authorId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to add resources to this course.');
    }

    return await Resource.create({ ...resourceData, author: authorId });
};

/**
 * Update an existing resource.
 * @param {string} resourceId - The ID of the resource to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user performing the update.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<object>} - The updated resource.
 */
exports.updateResource = async (resourceId, updateData, userId, userRole) => {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
        throw httpError.NotFound('Resource not found.');
    }

    if (resource.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to update this resource.');
    }

    Object.assign(resource, updateData);
    await resource.save();
    return resource;
};

/**
 * Delete a resource.
 * @param {string} resourceId - The ID of the resource to delete.
 * @param {string} userId - The ID of the user performing the delete.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<void>}
 */
exports.deleteResource = async (resourceId, userId, userRole) => {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
        throw httpError.NotFound('Resource not found.');
    }

    if (resource.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this resource.');
    }

    await resource.deleteOne();
};