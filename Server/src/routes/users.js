const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { uploadSingle, uploadToGCSMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);

// Updated resume upload to use GCS
router.post('/upload-resume', 
  authenticate, 
  uploadSingle('resume'),
  uploadToGCSMiddleware('documents'),
  handleUploadError,
  userController.uploadResume
);

router.get('/', authenticate, requireRole(['admin','superadmin']), userController.listUsers);

module.exports = router;
