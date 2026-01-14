const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');

// Team management routes for events
router.get('/:eventId/team-status', authenticate, teamController.getTeamStatus);
router.get('/:eventId/problem-statements', authenticate, teamController.getProblemStatements);
router.get('/:eventId/validate-team', authenticate, teamController.validateTeamForSubmission);
router.post('/:eventId/create-team', authenticate, teamController.createTeam);
router.post('/:eventId/join-team', authenticate, teamController.joinTeam);

module.exports = router;