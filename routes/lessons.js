const express = require('express');
const router = express.Router();
const { getLessonById } = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/lessons/:id
// @desc    Get a single lesson by ID (Protected)
router.get('/:id', protect, getLessonById);

module.exports = router;
