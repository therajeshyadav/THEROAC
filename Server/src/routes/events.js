const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');
const imageUpload = require('../middleware/imageUpload');
const mediaUpload = require('../middleware/mediaUpload');

// Public routes (no authentication required)
router.get('/', eventController.listEvents);
router.get('/slug/:slug', eventController.getEventBySlug);

// Protected routes (authentication required) - MUST come before /:id route
router.get('/my-events', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.getMyEvents);

// Public route with dynamic ID - MUST come after specific routes
router.get('/:id', eventController.getEvent);
router.get('/:id/registration-status', authenticate, attachOrganizationContext, eventController.checkEventRegistrationStatus);

router.post('/', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.createEvent);
router.put('/:id', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.updateEvent);
router.post('/upload-image', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), imageUpload.single('image'), eventController.uploadEventImage);
router.post('/upload-media', authenticate, attachOrganizationContext, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), mediaUpload.single('media'), eventController.uploadEventMedia);
router.post('/:id/register', authenticate, attachOrganizationContext, eventController.registerForEvent);

module.exports = router;
