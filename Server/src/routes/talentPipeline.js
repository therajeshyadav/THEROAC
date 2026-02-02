const express = require('express');
const router = express.Router();
const talentPipelineController = require('../controllers/talentPipelineController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get pipeline statistics
router.get('/stats', talentPipelineController.getPipelineStats);

// Get all candidates in pipeline
router.get('/', talentPipelineController.getTalentPipeline);

// Get single candidate from pipeline
router.get('/:id', talentPipelineController.getPipelineCandidate);

// Add candidate to pipeline
router.post('/', talentPipelineController.addToTalentPipeline);

// Add from job application
router.post('/from-application/:applicationId', talentPipelineController.addFromJobApplication);

// Update pipeline candidate
router.put('/:id', talentPipelineController.updatePipelineCandidate);

// Remove from pipeline
router.delete('/:id', talentPipelineController.removeFromPipeline);

module.exports = router;
