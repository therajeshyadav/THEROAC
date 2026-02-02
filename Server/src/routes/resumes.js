const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle, uploadToGCSMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

router.use(authenticate);

// Updated resume upload to use GCS
router.post('/upload', 
  uploadSingle('resume'),
  uploadToGCSMiddleware('documents'),
  handleUploadError,
  resumeController.uploadResume
);

router.get('/', resumeController.getResumes);
router.put('/:id/default', resumeController.setDefaultResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
