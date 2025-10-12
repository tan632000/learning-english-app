const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, updateUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes in this file and authorize only for 'admin' role
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/status', updateUserStatus);

module.exports = router;