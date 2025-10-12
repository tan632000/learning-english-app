const express = require('express');
const router = express.Router();
const {
    follow,
    unfollow,
    getSuggestions
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

// All routes require a logged-in user
router.use(protect);

router.get('/suggestions', getSuggestions);

router.post('/instructors/:id/follow', follow);
router.delete('/instructors/:id/unfollow', unfollow);

module.exports = router;