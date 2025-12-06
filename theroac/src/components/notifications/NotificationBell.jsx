import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './NotificationBell.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick, getNotificationIcon, formatTime, onInviteResponse }) => {
  const [responding, setResponding] = useState(false);

  const handleAcceptInvite = async (e) => {
    e.stopPropagation();
    setResponding(true);
    
    try {
      const token = localStorage.getItem('token');
      const { organizationId, memberId } = notification.data;
      
      await axios.post(
        `${API_BASE_URL}/organizations/${organizationId}/members/${memberId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Invitation accepted! Welcome to the team!');
      onDelete(notification.id);
      onInviteResponse();
      
      // Reload page to update organization context
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error.response?.data?.error || 'Failed to accept invitation');
      setResponding(false);
    }
  };

  const handleRejectInvite = async (e) => {
    e.stopPropagation();
    setResponding(true);
    
    try {
      const token = localStorage.getItem('token');
      const { organizationId, memberId } = notification.data;
      
      await axios.delete(
        `${API_BASE_URL}/organizations/${organizationId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.info('Invitation declined');
      onDelete(notification.id);
      onInviteResponse();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
      setResponding(false);
    }
  };

  return (
    <div
      className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.type === 'organization_invite' ? 'invite-notification' : ''}`}
      onClick={() => onClick(notification)}
    >
      <div className="notification-icon">
        <i className={getNotificationIcon(notification.type)}></i>
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">{formatTime(notification.createdAt)}</div>
        
        {notification.type === 'organization_invite' && notification.data?.organizationId && (
          <div className="invite-actions">
            <button
              className="invite-btn accept-btn"
              onClick={handleAcceptInvite}
              disabled={responding}
            >
              {responding ? '...' : '✓ Accept'}
            </button>
            <button
              className="invite-btn reject-btn"
              onClick={handleRejectInvite}
              disabled={responding}
            >
              {responding ? '...' : '✗ Decline'}
            </button>
          </div>
        )}
      </div>
      <div className="notification-actions-menu">
        {!notification.read && notification.type !== 'organization_invite' && (
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title="Mark as read"
          >
            ✓
          </button>
        )}
        {notification.type !== 'organization_invite' && (
          <button
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title="Delete"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // For organization invites, don't navigate - let them handle it in the dropdown
    if (notification.type === 'organization_invite') {
      return;
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      application_status: 'fas fa-file-alt',
      new_application: 'fas fa-user',
      application_viewed: 'fas fa-eye',
      organization_invite: 'fas fa-building',
      job_posted: 'fas fa-briefcase',
      event_registration: 'fas fa-calendar',
      message: 'fas fa-comment',
      system: 'fas fa-cog'
    };
    return icons[type] || 'fas fa-bell';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {isConnected && <span className="connection-indicator" title="Connected"></span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash no-notif-icon"></i>
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={handleNotificationClick}
                  getNotificationIcon={getNotificationIcon}
                  formatTime={formatTime}
                  onInviteResponse={() => {
                    // Refresh notifications after accepting/rejecting
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
