const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/', hackathonController.listHackathons || ((req,res)=>res.send('list')));
router.get('/:id', hackathonController.getHackathon || ((req,res)=>res.send('get')));

router.post('/', authenticate, requireRole(['organizer','admin']), hackathonController.createHackathon);
router.post('/:hackathonId/teams', authenticate, hackathonController.createTeam);
router.post('/:hackathonId/submissions', authenticate, hackathonController.submitProject);

module.exports = router;
