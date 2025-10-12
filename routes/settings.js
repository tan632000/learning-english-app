const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to get non-sensitive settings.
// `protect` is used optionally. If a token is provided, req.user will be populated.
router.get('/', protect, getSettings);

// Private route for admins to update settings.
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;