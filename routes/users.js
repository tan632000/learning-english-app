const express = require('express');
const router = express.Router();
const { getLessonRecommendation, getLearningStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả các route trong file này đều yêu cầu đăng nhập
router.use(protect);

router.get('/me/recommendation', getLessonRecommendation);
router.get('/me/stats', getLearningStats);

module.exports = router;