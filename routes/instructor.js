const express = require('express');
const router = express.Router();
const { getCourseDashboardStats, getStudentStatsForCourse } = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this file are for instructors and are protected
router.use(protect, authorize(['admin', 'editor']));

router.get('/courses/:courseId/stats', getCourseDashboardStats);
router.get('/courses/:courseId/students', getStudentStatsForCourse);

module.exports = router;