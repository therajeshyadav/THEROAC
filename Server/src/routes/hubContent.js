const express = require('express');
const router = express.Router();
const hubContentController = require('../controllers/hubContentController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

// Public routes
router.get('/', hubContentController.listHubContent);
router.get('/:id', hubContentController.getHubContent);

// Protected routes (require authentication)
router.post('/', authenticate, requireRole(['admin', 'recruiter']), hubContentController.createHubContent);
router.put('/:id', authenticate, requireRole(['admin', 'recruiter']), hubContentController.updateHubContent);
router.delete('/:id', authenticate, requireRole(['admin']), hubContentController.deleteHubContent);

module.exports = router;