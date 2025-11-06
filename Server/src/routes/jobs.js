const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/', jobController.listJobs);
router.get('/applications', authenticate, jobController.getUserApplications);
router.get('/:id', jobController.getJob);

router.post('/', authenticate, requireRole(['recruiter','organizer','admin']), jobController.createJob);
router.post('/:jobId/apply', authenticate, jobController.applyToJob);

module.exports = router;
