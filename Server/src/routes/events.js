const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { attachOrganizationContext } = require('../middleware/organizationMiddleware');
const { uploadSingle, uploadToGCSMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');
const { validateTeamEligibility } = require('../middleware/teamValidation');

// Public routes (no authentication required)
router.get('/', eventController.listEvents);
router.get('/slug/:slug', eventController.getEventBySlug);

// Protected routes (authentication required) - MUST come before /:id route
router.get('/my-events', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.getMyEvents);
router.get('/participants', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.getEventParticipants);
router.get('/:eventId/teams/:teamId/submissions', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.getTeamSubmissions);
router.post('/:eventId/teams/:teamId/evaluate', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.evaluateTeam);

// Public route with dynamic ID - MUST come after specific routes
router.get('/:id', eventController.getEvent);
router.get('/:id/registration-status', authenticate, attachOrganizationContext, eventController.checkEventRegistrationStatus);

router.post('/', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.createEvent);
router.put('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.updateEvent);

// Updated upload routes to use GCS
router.post('/upload-image', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('image'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  eventController.uploadEventImage
);

// Separate endpoints for banner and thumbnail images
router.post('/upload-banner-image', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('image'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  eventController.uploadEventBannerImage
);

router.post('/upload-thumbnail-image', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('image'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  eventController.uploadEventThumbnailImage
);

router.post('/upload-sponsor-logo', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('image'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  eventController.uploadSponsorLogo
);

router.post('/upload-media', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('media'),
  uploadToGCSMiddleware('media'),
  handleUploadError,
  eventController.uploadEventMedia
);

// Problem statement upload endpoint
router.post('/upload-problem-statement', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), 
  uploadSingle('file'),
  uploadToGCSMiddleware('documents'),
  handleUploadError,
  eventController.uploadProblemStatement
);

router.post('/:id/register', authenticate, attachOrganizationContext, eventController.registerForEvent);

// Quiz routes for event stages
router.post('/:eventId/stages/:stageIndex/quiz/submit', authenticate, validateTeamEligibility, eventController.submitStageQuiz);
router.get('/:eventId/stages/:stageIndex/quiz/status', authenticate, eventController.getStageQuizStatus);
router.get('/:eventId/stages/:stageIndex/quiz/results', authenticate, eventController.getStageQuizResults);

// Team management routes for team-based events
router.get('/:eventId/team-status', authenticate, teamController.getTeamStatus);
router.get('/:eventId/problem-statements', authenticate, teamController.getProblemStatements);
router.get('/:eventId/validate-team', authenticate, teamController.validateTeamForSubmission);
router.post('/:eventId/create-team', authenticate, teamController.createTeam);
router.post('/:eventId/join-team', authenticate, teamController.joinTeam);

module.exports = router;
