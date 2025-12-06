const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');
const imageUpload = require('../middleware/imageUpload');

// Public routes (no authentication required)
router.get('/', jobController.listJobs);
router.get('/slug/:slug', jobController.getJobBySlug);
router.get('/:id', jobController.getJob);

// Protected routes (authentication required)
router.get('/applications', authenticate, attachOrganizationContext, jobController.getUserApplications);
router.get('/applications/recruiter', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.getRecruiterApplications);
router.get('/:jobId/application-status', authenticate, attachOrganizationContext, jobController.checkJobApplicationStatus);

router.post('/', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.createJob);
router.post('/upload-image', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), imageUpload.single('image'), jobController.uploadJobImage);
router.post('/:jobId/apply', authenticate, attachOrganizationContext, jobController.applyToJob);

router.put('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateJob);
router.put('/applications/:applicationId/status', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateApplicationStatus);
router.put('/applications/:applicationId/notes', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.updateApplicationNotes);
router.delete('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter','organizer','admin']), jobController.deleteJob);

module.exports = router;
