import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Clock, CheckCircle, XCircle, Eye, X, Briefcase, Calendar, User, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import './UniversalNotifications.css';

const UniversalNotifications = ({ onNotificationClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      let response;
      
      // Use different API endpoints based on user role
      if (user.role === 'admin' || user.role === 'superadmin') {
        response = await apiService.getAdminNotifications({ limit: 10 });
        setUnreadCount(response.counts?.totalUnread || 0);
        setPendingApprovalsCount(response.counts?.pendingApprovals || 0);
      } else {
        response = await apiService.getNotifications({ limit: 10 });
        setUnreadCount(response.unreadCount || 0);
        setPendingApprovalsCount(0); // Regular users don't have pending approvals
      }
      
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Use different API endpoints based on user role
      if (user.role === 'admin' || user.role === 'superadmin') {
        await apiService.markNotificationAsRead(notificationId);
      } else {
        await apiService.markUserNotificationAsRead(notificationId);
      }
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refresh notification data to ensure consistency
      setTimeout(() => {
        fetchNotifications();
      }, 500);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Use different API endpoints based on user role
      if (user.role === 'admin' || user.role === 'superadmin') {
        await apiService.markAllAdminNotificationsAsRead();
      } else {
        await apiService.markAllNotificationsAsRead();
      }
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      
      setUnreadCount(0);
      
      // Refresh notification data to ensure consistency
      setTimeout(() => {
        fetchNotifications();
      }, 500);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert local state on error
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and user role
    if (notification.type === 'job_pending_approval' || notification.type === 'event_pending_approval') {
      // Admin notifications - go to admin dashboard approvals
      if (onNotificationClick) {
        onNotificationClick('approvals');
      } else {
        navigate('/admin-dashboard?tab=approvals');
      }
    } else if (notification.type === 'job_approval' || notification.type === 'event_approval' || notification.type === 'internship_approval') {
      // Recruiter notifications - go to recruiter dashboard jobs tab
      navigate('/recruiter-dashboard?tab=jobs');
    } else if (notification.type === 'resubmission_allowed') {
      // Recruiter notifications for resubmission - go to jobs tab and show pending items
      navigate('/recruiter-dashboard?tab=jobs&showPending=true');
    } else if (notification.type === 'job_cancelled' || notification.type === 'event_cancelled' || notification.type === 'internship_cancelled') {
      // Candidate notifications - go to candidate dashboard applications
      navigate('/candidate-dashboard?tab=applications');
    } else if (notification.type === 'application_status') {
      // Candidate notifications - go to candidate dashboard
      navigate('/candidate-dashboard?tab=applications');
    } else if (notification.type === 'new_application') {
      // Recruiter notifications - go to applications
      navigate('/recruiter-dashboard?tab=evaluate');
    } else if (notification.actionUrl && notification.actionUrl.startsWith('/')) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

  const handleViewAllClick = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  const getNotificationIcon = (type, data) => {
    switch (type) {
      case 'job_approval':
        return data?.action === 'approve' 
          ? <CheckCircle className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />;
      case 'event_approval':
        return data?.action === 'approve'
          ? <CheckCircle className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />;
      case 'internship_approval':
        return data?.action === 'approve'
          ? <CheckCircle className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />;
      case 'job_pending_approval':
        return <Briefcase className="w-4 h-4 text-orange-500" />;
      case 'event_pending_approval':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'resubmission_allowed':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'job_cancelled':
      case 'event_cancelled':
      case 'internship_cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'application_status':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'new_application':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'application_viewed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'organization_invite':
        return <User className="w-4 h-4 text-indigo-500" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'interview_rescheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // For admin users, show unread notifications count only
  // Pending approvals are shown separately in the dropdown
  const totalNotifications = unreadCount;

  return (
    <div className="universal-notifications" ref={dropdownRef}>
      <button 
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalNotifications > 0 && (
          <span className="notification-badge">
            {totalNotifications > 99 ? '99+' : totalNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Show pending approvals alert for admins */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && pendingApprovalsCount > 0 && (
            <div className="pending-approvals-alert">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>
                {pendingApprovalsCount} item{pendingApprovalsCount > 1 ? 's' : ''} pending approval
              </span>
              <button 
                className="view-approvals-btn"
                onClick={() => {
                  if (onNotificationClick) {
                    onNotificationClick('approvals');
                  } else {
                    navigate('/admin-dashboard?tab=approvals');
                  }
                  setIsOpen(false);
                }}
              >
                Review
              </button>
            </div>
          )}

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="loading-spinner"></div>
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell className="w-8 h-8 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type, notification.data)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button 
                className="view-all-btn"
                onClick={handleViewAllClick}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalNotifications;