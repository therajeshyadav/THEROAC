const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middlewares/auth');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');

// Public routes (no authentication required)
router.get('/', (req,res)=>res.send('Hackathons list - use /events instead'));
router.get('/:id', (req,res)=>res.send('Hackathon details - use /events instead'));

// Protected routes (authentication required) - Redirect to team management
router.post('/:hackathonId/teams', authenticate, attachOrganizationContext, teamController.createTeam);

module.exports = router;
