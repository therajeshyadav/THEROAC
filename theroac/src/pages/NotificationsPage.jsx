import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, XCircle, Clock, ArrowLeft, CheckCheck, Briefcase, Calendar, User, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filter === 'unread' && { unreadOnly: 'true' })
      };

      // Use different API endpoints based on user role
      let response;
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        response = await apiService.getAdminNotifications(params);
      } else {
        response = await apiService.getNotifications(params);
      }
      
      setNotifications(response.notifications || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Use different API endpoints based on user role
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        await apiService.markNotificationAsRead(notificationId);
      } else {
        await apiService.markUserNotificationAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      
      // For admin users, we need to mark notifications individually since there's no bulk endpoint
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        const unreadNotifications = notifications.filter(n => !n.read);
        for (const notification of unreadNotifications) {
          await apiService.markNotificationAsRead(notification.id);
        }
      } else {
        await apiService.markAllNotificationsAsRead();
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and user role
    if (notification.actionUrl) {
      if (notification.type === 'job_pending_approval' || notification.type === 'event_pending_approval') {
        // Admin notifications - go to admin dashboard approvals
        navigate('/admin-dashboard?tab=approvals');
      } else if (notification.type === 'job_approval' || notification.type === 'event_approval') {
        // Recruiter notifications - go to recruiter dashboard
        navigate('/recruiter-dashboard?tab=jobs');
      } else if (notification.type === 'application_status') {
        // Candidate notifications - go to candidate dashboard
        navigate('/candidate-dashboard?tab=applications');
      } else if (notification.type === 'new_application') {
        // Recruiter notifications - go to applications
        navigate('/recruiter-dashboard?tab=evaluate');
      } else if (notification.actionUrl.startsWith('/')) {
        navigate(notification.actionUrl);
      }
    }
  };

  const getNotificationIcon = (type, data) => {
    switch (type) {
      case 'job_approval':
        return data?.action === 'approve' 
          ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />;
      case 'event_approval':
        return data?.action === 'approve'
          ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />;
      case 'job_pending_approval':
        return <Briefcase className="w-5 h-5 text-orange-500" />;
      case 'event_pending_approval':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'application_status':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'new_application':
        return <User className="w-5 h-5 text-purple-500" />;
      case 'application_viewed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'organization_invite':
        return <User className="w-5 h-5 text-indigo-500" />;
      case 'interview_scheduled':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'interview_rescheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, data) => {
    switch (type) {
      case 'job_approval':
      case 'event_approval':
        return data?.action === 'approve' ? 'green' : 'red';
      case 'job_pending_approval':
      case 'event_pending_approval':
        return 'orange';
      case 'application_status':
        return 'blue';
      case 'new_application':
        return 'purple';
      case 'organization_invite':
        return 'indigo';
      case 'interview_scheduled':
        return 'green';
      case 'interview_rescheduled':
        return 'yellow';
      case 'system':
        return 'red';
      default:
        return 'gray';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1>Notifications</h1>
              <p>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                disabled={markingAllRead}
              >
                {markingAllRead ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Mark All Read ({unreadCount})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="notifications-filters">
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
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell className="w-16 h-16 text-gray-400" />
              <h3>No notifications</h3>
              <p>
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.read ? 'unread' : ''} ${getNotificationColor(notification.type, notification.data)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type, notification.data)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    
                    {notification.data?.rejectionReason && (
                      <div className="rejection-reason">
                        <strong>Reason:</strong> {notification.data.rejectionReason}
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="unread-indicator">
                      <div className="unread-dot"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;