const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Candidate routes
router.get('/candidate', interviewController.getCandidateInterviews);

// Recruiter routes
router.post('/schedule', interviewController.scheduleInterview);
router.get('/recruiter', interviewController.getRecruiterInterviews);

// Shared routes
router.put('/:id/status', interviewController.updateInterviewStatus);
router.put('/:id/reschedule', interviewController.rescheduleInterview);

module.exports = router;
