const express = require('express');
const router = express.Router();
const {
    getCategories,
    getThreads,
    getThread,
    createThread,
    createPost
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

// All forum routes require a logged-in user
router.use(protect);

router.get('/categories', getCategories);

router.route('/threads')
    .get(getThreads) // Get threads by categoryId in query
    .post(createThread);

router.route('/threads/:threadId')
    .get(getThread)
    .post(createPost); // Create a new post (reply) in a thread

module.exports = router;