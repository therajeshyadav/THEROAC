const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/', jobController.listJobs || ((req,res)=>res.send('list')));
router.get('/:id', jobController.getJob || ((req,res)=>res.send('get')));

router.post('/', authenticate, requireRole(['recruiter','organizer','admin']), jobController.createJob);
router.post('/:jobId/apply', authenticate, jobController.applyToJob);

module.exports = router;
