const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/upload
// @desc    Upload a single file
// 'file' là tên của field trong form-data
router.post('/', protect, authorize(['admin', 'editor']), upload.single('file'), uploadFile);

module.exports = router;