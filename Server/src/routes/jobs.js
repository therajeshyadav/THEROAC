const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { attachOrganizationContext } = require('../middleware/organizationMiddleware');
const { uploadSingle, uploadToGCSMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes (no authentication required)
router.get('/', jobController.listJobs);
router.get('/slug/:slug', jobController.getJobBySlug);

// Protected routes (authentication required) - MUST come before /:id route
router.get('/my-jobs', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.getMyJobs);
router.get('/applications', authenticate, attachOrganizationContext, jobController.getUserApplications);

// Generic ID route MUST come after specific routes
router.get('/:id', jobController.getJob);
router.get('/:jobId/applications', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.getJobApplications);
router.get('/applications/recruiter', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.getRecruiterApplications);
router.get('/:jobId/application-status', authenticate, attachOrganizationContext, jobController.checkJobApplicationStatus);

router.post('/', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.createJob);
router.post('/upload-image', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter','organizer','admin']), 
  uploadSingle('image'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  jobController.uploadJobImage
);

// Separate endpoints for company logo and banner image
router.post('/upload-company-logo', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter','organizer','admin']), 
  uploadSingle('logo'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  jobController.uploadCompanyLogo
);

router.post('/upload-banner-image', 
  authenticate, 
  attachOrganizationContext, 
  requireRole(['recruiter','organizer','admin']), 
  uploadSingle('banner'),
  uploadToGCSMiddleware('images'),
  handleUploadError,
  jobController.uploadBannerImage
);
router.post('/:jobId/apply', authenticate, attachOrganizationContext, jobController.applyToJob);

router.put('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateJob);
router.put('/applications/:applicationId/status', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateApplicationStatus);
router.put('/applications/:applicationId/notes', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateApplicationNotes);
router.put('/applications/:applicationId/move-stage', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.moveToNextStage);
router.post('/applications/:applicationId/submit-stage', authenticate, attachOrganizationContext, jobController.submitStage);
router.delete('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.deleteJob);

module.exports = router;
