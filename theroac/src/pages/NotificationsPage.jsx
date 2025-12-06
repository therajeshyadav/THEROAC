import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './NotificationsPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [responding, setResponding] = useState({});
  const navigate = useNavigate();

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

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

  const getNotificationColor = (type) => {
    const colors = {
      application_status: '#4CAF50',
      new_application: '#2196F3',
      application_viewed: '#FF9800',
      organization_invite: '#9C27B0',
      job_posted: '#FFD600',
      event_registration: '#00BCD4',
      message: '#E91E63',
      system: '#607D8B'
    };
    return colors[type] || '#999';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return notifDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.type === 'organization_invite') {
      return;
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleAcceptInvite = async (notification) => {
    setResponding({ ...responding, [notification.id]: true });
    
    try {
      const token = localStorage.getItem('token');
      const { organizationId, memberId } = notification.data;
      
      await axios.post(
        `${API_BASE_URL}/organizations/${organizationId}/members/${memberId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Invitation accepted! Welcome to the team!');
      deleteNotification(notification.id);
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error.response?.data?.error || 'Failed to accept invitation');
      setResponding({ ...responding, [notification.id]: false });
    }
  };

  const handleRejectInvite = async (notification) => {
    setResponding({ ...responding, [notification.id]: true });
    
    try {
      const token = localStorage.getItem('token');
      const { organizationId, memberId } = notification.data;
      
      await axios.delete(
        `${API_BASE_URL}/organizations/${organizationId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.info('Invitation declined');
      deleteNotification(notification.id);
      setResponding({ ...responding, [notification.id]: false });
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
      setResponding({ ...responding, [notification.id]: false });
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <div className="header-actions">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                <i className="fas fa-check-double"></i> Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="notifications-content">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <i className="fas fa-bell-slash"></i>
              <h3>No notifications</h3>
              <p>
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.read ? 'unread' : ''} ${notification.type === 'organization_invite' ? 'invite-card' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: notification.type === 'organization_invite' ? 'default' : 'pointer' }}
                >
                  <div 
                    className="notification-icon-wrapper"
                    style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                  >
                    <i 
                      className={getNotificationIcon(notification.type)}
                      style={{ color: getNotificationColor(notification.type) }}
                    ></i>
                  </div>
                  
                  <div className="notification-body">
                    <div className="notification-header-row">
                      <h4>{notification.title}</h4>
                      <span className="notification-time">{formatTime(notification.createdAt)}</span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.type === 'organization_invite' && notification.data?.organizationId && (
                      <div className="invite-actions">
                        <button
                          className="invite-btn accept-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptInvite(notification);
                          }}
                          disabled={responding[notification.id]}
                        >
                          {responding[notification.id] ? (
                            <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                          ) : (
                            <><i className="fas fa-check"></i> Accept Invitation</>
                          )}
                        </button>
                        <button
                          className="invite-btn reject-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectInvite(notification);
                          }}
                          disabled={responding[notification.id]}
                        >
                          {responding[notification.id] ? (
                            <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                          ) : (
                            <><i className="fas fa-times"></i> Decline</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="notification-actions">
                    {!notification.read && notification.type !== 'organization_invite' && (
                      <button
                        className="action-btn mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    {notification.type !== 'organization_invite' && (
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
