const express = require('express');
const router = express.Router();
const candidateDashboardController = require('../controllers/candidateDashboardController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/stats', candidateDashboardController.getCandidateStats);
router.get('/recommendations', candidateDashboardController.getJobRecommendations);
router.get('/analytics', candidateDashboardController.getApplicationAnalytics);

module.exports = router;
