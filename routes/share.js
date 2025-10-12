const express = require('express');
const router = express.Router();
const { createShareLink, getSharedProgress } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// Route for user to create a shareable link (requires login)
router.post('/course-completion', protect, createShareLink);

// Public route for anyone to view the shared achievement page
router.get('/progress/:shareId', getSharedProgress);

module.exports = router;