const express = require('express');
const router = express.Router();
const { addWordToBook, getWordsFromBook, getReviewWords, updateReviewStatus } = require('../controllers/wordbookController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(protect);

router.get('/review', getReviewWords);
router.post('/review/:id', updateReviewStatus);

router.route('/')
    .post(addWordToBook)
    .get(getWordsFromBook);

module.exports = router;