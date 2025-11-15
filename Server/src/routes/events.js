const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/', eventController.listEvents);
router.get('/slug/:slug', eventController.getEventBySlug);
router.get('/:id/registration-status', authenticate, eventController.checkEventRegistrationStatus);
router.get('/:id', eventController.getEvent);

// Protected
router.post('/', authenticate, requireRole(['recruiter', 'organizer', 'admin', 'superadmin']), eventController.createEvent);
router.post('/:id/register', authenticate, eventController.registerForEvent);

module.exports = router;
