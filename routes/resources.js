const express = require('express');
const router = express.Router();
const {
    createResource,
    getResources,
    updateResource,
    deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route for students to view resources for a course
router.route('/').get(protect, getResources);

// Private routes for instructors/admins to manage resources
router.route('/')
    .post(protect, authorize(['admin', 'editor']), createResource);
router.route('/:id')
    .put(protect, authorize(['admin', 'editor']), updateResource)
    .delete(protect, authorize(['admin', 'editor']), deleteResource);

module.exports = router;