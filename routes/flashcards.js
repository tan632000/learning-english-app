const express = require('express');
const router = express.Router();
const {
    createSet,
    getAllSets,
    getSetById,
    updateSet,
    deleteSet
} = require('../controllers/flashcardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes for students
router.route('/').get(protect, getAllSets);
router.route('/:id').get(protect, getSetById);

// Private routes for instructors/admins
router.route('/')
    .post(protect, authorize(['admin', 'editor']), createSet);
router.route('/:id')
    .put(protect, authorize(['admin', 'editor']), updateSet)
    .delete(protect, authorize(['admin', 'editor']), deleteSet);

module.exports = router;