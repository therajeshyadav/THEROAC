const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { uploadAny, uploadToGCSMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');
const { validateTeamEligibility } = require('../middleware/teamValidation');

// Import controller methods individually to avoid any potential issues
const {
  getEventStages,
  submitStageSubmission,
  getStageSubmissionStatus,
  getUserStageSubmissions,
  getStageSubmissions,
  updateSubmissionStatus
} = require('../controllers/eventStageController');

// Get event stages
router.get('/:eventId/stages', getEventStages);

// Submit stage submission with file upload support and team validation
router.post('/:eventId/stages/:stageId/submit', 
  authenticate, 
  validateTeamEligibility, // Add team validation middleware
  uploadAny(10), // Accept files with any field names (up to 10 files)
  uploadToGCSMiddleware('submissions'),
  handleUploadError,
  submitStageSubmission
);

// Get stage submission status for current user
router.get('/:eventId/stages/:stageId/submission-status', authenticate, getStageSubmissionStatus);

// Get all user's submissions for an event
router.get('/:eventId/my-submissions', authenticate, getUserStageSubmissions);

// Get all submissions for a stage (for organizers/judges)
router.get('/:eventId/stages/:stageId/submissions', authenticate, getStageSubmissions);

// Update submission status (for judges/organizers)
router.put('/submissions/:submissionId/status', authenticate, updateSubmissionStatus);

module.exports = router;