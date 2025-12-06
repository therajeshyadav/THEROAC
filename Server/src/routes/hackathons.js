const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');

// Public routes (no authentication required)
router.get('/', hackathonController.listHackathons || ((req,res)=>res.send('list')));
router.get('/:id', hackathonController.getHackathon || ((req,res)=>res.send('get')));

// Protected routes (authentication required)
router.post('/', authenticate, attachOrganizationContext, requireRole(['organizer','admin']), hackathonController.createHackathon);
router.post('/:hackathonId/teams', authenticate, attachOrganizationContext, hackathonController.createTeam);
router.post('/:hackathonId/submissions', authenticate, attachOrganizationContext, hackathonController.submitProject);

module.exports = router;
