const express = require('express');
const router = express.Router();
const { getLessonById, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/lessons/:id
// @desc    Get a single lesson by ID (Protected)
router.route('/:id')
    .get(protect, getLessonById)
    .put(protect, authorize(['admin', 'editor']), updateLesson)
    .delete(protect, authorize(['admin', 'editor']), deleteLesson);

module.exports = router;
