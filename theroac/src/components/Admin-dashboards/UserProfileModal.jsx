import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import './UserProfileModal.css';

const UserProfileModal = ({ user, isOpen, onClose, getUserInitials }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'banned': return '#F44336';
      case 'suspended': return '#FF9800';
      default: return '#757575';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#E91E63';
      case 'superadmin': return '#9C27B0';
      case 'recruiter': return '#2196F3';
      case 'candidate': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'banned': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Profile Details</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Information Section */}
          <div className="detail-section">
            <h4>Basic Information</h4>
            <div className="user-profile-header">
              <div className="user-avatar-large">
                {user.profilePicture || user.avatar ? (
                  <img
                    src={user.profilePicture || user.avatar}
                    alt={user.fullName || "User"}
                    className="profile-image"
                  />
                ) : (
                  <span className="profile-initials-large">
                    {getUserInitials(user.fullName)}
                  </span>
                )}
              </div>
              <div className="user-basic-info">
                <h5 className="user-name">{user.fullName || 'Unknown User'}</h5>
                <p className="user-email">{user.email}</p>
                <div className="user-badges">
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {getStatusIcon(user.status)}
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{user.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{user.fullName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value" style={{ color: getRoleColor(user.role) }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="detail-section">
            <h4>Contact Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {[user.city, user.state, user.country].filter(Boolean).join(', ') || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status Section */}
          <div className="detail-section">
            <h4>Account Status</h4>
            <div className="account-status-display">
              <div className="status-info-card">
                <div className="status-header">
                  {getStatusIcon(user.status)}
                  <div>
                    <span className="status-label">Current Status:</span>
                    <span 
                      className="status-value"
                      style={{ color: getStatusColor(user.status) }}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Email Verified:</span>
                <span className={`detail-value ${user.isVerified ? 'verified' : 'unverified'}`}>
                  {user.isVerified ? (
                    <span style={{ color: '#4CAF50' }}>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span style={{ color: '#FF9800' }}>
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Not Verified
                    </span>
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Created:</span>
                <span className="detail-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
                </span>
              </div>
              {user.failedLoginAttempts > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Failed Login Attempts:</span>
                  <span className="detail-value" style={{ color: '#F44336' }}>
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {user.failedLoginAttempts}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          {user.bio && (
            <div className="detail-section">
              <h4>Bio</h4>
              <div className="bio-display">
                <p className="bio-text">{user.bio}</p>
              </div>
            </div>
          )}

          {/* Account Statistics Section */}
          <div className="detail-section">
            <h4>Account Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Last Activity</span>
                  <span className="stat-value">
                    {user.lastLogin ? 
                      new Date(user.lastLogin).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      'No activity'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;