import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X, 
  Briefcase, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, onNotificationClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, filter, page]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filter === 'unread' && { unreadOnly: 'true' })
      };

      let response;
      
      // Use different API endpoints based on user role
      if (user.role === 'admin' || user.role === 'superadmin') {
        response = await apiService.getAdminNotifications(params);
        setUnreadCount(response.counts?.totalUnread || 0);
        setPendingApprovalsCount(response.counts?.pendingApprovals || 0);
      } else {
        response = await apiService.getNotifications(params);
        setUnreadCount(response.unreadCount || 0);
        setPendingApprovalsCount(0);
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
      if (user.role === 'admin' || user.role === 'superadmin') {
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
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      
      // For admin users, we need to mark notifications individually since there's no bulk endpoint
      if (user.role === 'admin' || user.role === 'superadmin') {
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
      
      setUnreadCount(0);
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
    
    onClose();
  };

  const handleViewAllClick = () => {
    navigate('/notifications');
    onClose();
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
      case 'internship_approval':
        return data?.action === 'approve'
          ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />;
      case 'job_pending_approval':
        return <Briefcase className="w-5 h-5 text-orange-500" />;
      case 'event_pending_approval':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'resubmission_allowed':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'job_cancelled':
      case 'event_cancelled':
      case 'internship_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
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

  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div 
        className={`notification-modal ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Header */}
        <div className="notification-modal-header">
          <div className="header-left">
            <Bell className="w-6 h-6" />
            <div>
              <h2>Notifications</h2>
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
            
            <button className="close-btn" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Show pending approvals alert for admins */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && pendingApprovalsCount > 0 && (
          <div className="pending-approvals-alert">
            <Clock className="w-5 h-5 text-orange-500" />
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
                onClose();
              }}
            >
              Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="notification-filters">
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

        {/* Content */}
        <div className="notification-modal-content">
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

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notification-modal-footer">
            <button 
              className="view-all-btn"
              onClick={handleViewAllClick}
            >
              View All Notifications
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;