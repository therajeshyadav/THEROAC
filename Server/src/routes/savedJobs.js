const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/toggle', savedJobController.toggleSaveJob);
router.get('/', savedJobController.getSavedJobs);
router.get('/status/:jobType/:jobId', savedJobController.checkSavedStatus);
router.put('/:id', savedJobController.updateSavedJob);
router.get('/collections', savedJobController.getCollections);

module.exports = router;
