const express = require('express');
const router = express.Router();
const { getChallenge, submitChallenge } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getChallenge);
router.post('/today/submit', submitChallenge);

module.exports = router;