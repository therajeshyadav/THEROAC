const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

// Candidate dashboard routes (require authentication only)
router.get('/candidate/stats', authenticate, dashboardController.getCandidateStats);

// Organizer/Recruiter dashboard routes (require specific roles)
router.use(authenticate);
router.use(requireRole(['recruiter', 'organizer', 'admin']));

// Get organizer dashboard statistics
router.get('/stats', dashboardController.getOrganizerStats);

// Get candidates list with pagination and filtering
router.get('/candidates', dashboardController.getCandidates);

// Get analytics data for charts
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;