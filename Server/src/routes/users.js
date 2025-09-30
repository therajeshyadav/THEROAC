const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);

router.get('/', authenticate, requireRole(['admin','superadmin']), userController.listUsers);

module.exports = router;
