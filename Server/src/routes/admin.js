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
router.put('/jobs/:jobId/status', adminOnly, adminController.updateJobStatus);
router.delete('/jobs/:jobId', adminOnly, adminController.deleteJob);

// Event Management
router.get('/events', adminOnly, adminController.getAllEvents);
router.put('/events/:eventId/status', adminOnly, adminController.updateEventStatus);
router.delete('/events/:eventId', adminOnly, adminController.deleteEvent);

// Analytics
router.get('/analytics', adminOnly, adminController.getAnalytics);

// Application Management
router.get('/applications', adminOnly, adminController.getAllApplications);

// Approval System
router.get('/pending-approvals', adminOnly, adminController.getPendingApprovals);
router.put('/jobs/:jobId/approve', adminOnly, adminController.approveJob);
router.put('/events/:eventId/approve', adminOnly, adminController.approveEvent);
router.put('/internships/:internshipId/approve', adminOnly, adminController.approveInternship);
router.put('/roac-prime/:contentId/approve', adminOnly, adminController.approveROACPrime);

// Banned User Contact
router.post('/banned-user-contact', adminController.handleBannedUserContact);

// Platform Settings
router.get('/settings', adminOnly, adminController.getPlatformSettings);
router.put('/settings', adminOnly, adminController.updatePlatformSettings);

// Notifications
router.get('/notifications', adminOnly, adminController.getAdminNotifications);
router.put('/notifications/:notificationId/read', adminOnly, adminController.markNotificationAsRead);
router.put('/notifications/mark-all-read', adminOnly, adminController.markAllNotificationsAsRead);

// Rejected Items Management
router.get('/rejected-items', adminOnly, adminController.getRejectedItems);
router.put('/rejected-items/:type/:itemId/allow-resubmission', adminOnly, adminController.allowResubmission);

// Banned User Contact
router.post('/banned-user-contact', adminController.handleBannedUserContact);

module.exports = router;