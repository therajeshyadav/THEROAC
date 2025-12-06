const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.put('/:id/default', resumeController.setDefaultResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
