const express = require('express');
const router = express.Router();
const {
    getUsers, updateUserRole, updateUserStatus, getDashboardStats, getTimeSeriesStats,
    getAllCourses, getAllLessons, getAllFlashcardSets
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes in this file and authorize only for 'admin' role
router.use(protect, authorize('admin'));

// Dashboard & Reports
router.get('/dashboard', getDashboardStats);
router.get('/reports/timeseries', getTimeSeriesStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/status', updateUserStatus);

// Content Moderation
router.get('/content/courses', getAllCourses);
router.get('/content/lessons', getAllLessons);
router.get('/content/flashcard-sets', getAllFlashcardSets);

module.exports = router;