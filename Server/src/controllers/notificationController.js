const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const unreadCount = await Notification.count({
      where: { userId, read: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { read: true, readAt: new Date() },
      { where: { userId, read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.count({
      where: { userId, read: false }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = exports;
