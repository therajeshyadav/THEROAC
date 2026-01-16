const express = require('express');
const router = express.Router();
const hubContentController = require('../controllers/hubContentController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');

// Public routes
router.get('/', hubContentController.listHubContent);
router.get('/roac-prime-hub/status', hubContentController.getROACPrimeHubStatus);
router.get('/slug/:slug', hubContentController.getHubContentBySlug);

// Protected routes (require authentication) - MUST come before /:id route
router.get('/my-content', authenticate, attachOrganizationContext, requireRole(['recruiter', 'admin']), hubContentController.getMyHubContent);
router.get('/applications', authenticate, attachOrganizationContext, hubContentController.getUserHubContentApplications);

// Public routes with ID parameters - MUST come after specific routes
router.get('/:id/applications', authenticate, attachOrganizationContext, requireRole(['recruiter', 'admin']), hubContentController.getInternshipApplications);
router.get('/:id/application-status', authenticate, hubContentController.checkHubContentApplicationStatus);
router.get('/:id', hubContentController.getHubContent);
router.post('/', authenticate, attachOrganizationContext, requireRole(['admin', 'recruiter']), hubContentController.createHubContent);
router.post('/:id/apply', authenticate, attachOrganizationContext, hubContentController.applyToHubContent);
router.put('/:id', authenticate, attachOrganizationContext, requireRole(['admin', 'recruiter']), hubContentController.updateHubContent);
router.put('/applications/:applicationId/status', authenticate, attachOrganizationContext, requireRole(['recruiter', 'admin']), hubContentController.updateInternshipApplicationStatus);
router.put('/applications/:applicationId/move-stage', authenticate, attachOrganizationContext, requireRole(['recruiter', 'admin']), hubContentController.moveInternshipToNextStage);
router.post('/applications/:applicationId/submit-stage', authenticate, attachOrganizationContext, hubContentController.submitInternshipStage);
router.delete('/:id', authenticate, attachOrganizationContext, requireRole(['admin']), hubContentController.deleteHubContent);

module.exports = router;