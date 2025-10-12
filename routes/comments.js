const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    toggleLike
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// All routes require user to be logged in
router.use(protect);

router.route('/')
    .get(getComments)
    .post(addComment);

router.route('/:id')
    .put(updateComment)
    .delete(deleteComment);

router.post('/:id/like', toggleLike);

module.exports = router;