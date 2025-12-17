const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { Notification } = require('../models');

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Get unread count
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, read: false }
    });

    res.json({
      notifications: notifications.rows,
      unreadCount,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(notifications.count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({
      error: 'Failed to fetch notifications. Please try again.'
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({
      error: 'Failed to mark notification as read. Please try again.'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    await Notification.update(
      { read: true, readAt: new Date() },
      { where: { userId: req.user.id, read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return res.status(500).json({
      error: 'Failed to mark notifications as read. Please try again.'
    });
  }
});

module.exports = router;