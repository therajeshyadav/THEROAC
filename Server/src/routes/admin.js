const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

// Admin middleware - only admin/superadmin can access
const adminOnly = [authenticate, requireRole(['admin', 'superadmin'])];

// Dashboard Stats
router.get('/dashboard/stats', adminOnly, adminController.getDashboardStats);

// User Management
router.get('/users', adminOnly, adminController.getAllUsers);
router.put('/users/:userId/status', adminOnly, adminController.updateUserStatus);

// Job Management
router.get('/jobs', adminOnly, adminController.getAllJobs);

// Event Management
router.get('/events', adminOnly, adminController.getAllEvents);

// Analytics
router.get('/analytics', adminOnly, adminController.getAnalytics);

module.exports = router;