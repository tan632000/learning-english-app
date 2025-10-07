const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, createQuiz, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Instructor/Admin Routes ---
router.route('/')
    .post(protect, authorize(['admin', 'editor']), createQuiz);

router.route('/:id')
    .put(protect, authorize(['admin', 'editor']), updateQuiz)
    .delete(protect, authorize(['admin', 'editor']), deleteQuiz);

// --- Student Routes ---

// @route   GET /api/quizzes/:id
// @desc    Get a quiz (data varies by user role)
router.get('/:id', protect, getQuiz);

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers for grading
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;