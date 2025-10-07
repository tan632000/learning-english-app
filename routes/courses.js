const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { createLesson } = require('../controllers/lessonController'); // Import createLesson for nested route
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/courses
// @desc    Get all published courses (Public)
router.route('/').get(getCourses);

// @route   GET /api/courses/:id
// @desc    Get a single course by ID (Public)
router.route('/:id').get(getCourseById);

// Admin/Editor routes
router.route('/')
    .post(protect, authorize(['admin', 'editor']), createCourse);
router.route('/:id')
    .put(protect, authorize(['admin', 'editor']), updateCourse)
    .delete(protect, authorize(['admin', 'editor']), deleteCourse); // Authorization check for author is in service

// @route   POST /api/courses/:courseId/lessons
// @desc    Create a new lesson for a course (Admin/Editor or Course Author)
router.route('/:courseId/lessons')
    .post(protect, authorize(['admin', 'editor']), createLesson);

module.exports = router;
