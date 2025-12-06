import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await axios.get(
        `${API_BASE_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        }
      );

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Also notify socket
      socketService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      await axios.patch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket
    socketService.connect(token);

    // Handle connection status
    const handleConnect = () => {
      setIsConnected(true);
      socketService.requestNotifications();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Handle new notifications
    const handleNewNotification = (notification) => {
      console.log('📬 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          badge: '/logo192.png'
        });
      }
    };

    // Handle notification list
    const handleNotificationsList = (notificationsList) => {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = notificationsList.filter(n => !existingIds.has(n.id));
        return [...newNotifications, ...prev];
      });
    };

    // Handle notification marked as read
    const handleNotificationMarkedRead = ({ notificationId }) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Register event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('new_notification', handleNewNotification);
    socketService.on('notifications_list', handleNotificationsList);
    socketService.on('notification_marked_read', handleNotificationMarkedRead);

    // Fetch initial notifications
    fetchNotifications();

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('new_notification', handleNewNotification);
      socketService.off('notifications_list', handleNotificationsList);
      socketService.off('notification_marked_read', handleNotificationMarkedRead);
    };
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
