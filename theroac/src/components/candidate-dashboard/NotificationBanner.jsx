// src/components/candidate-dashboard/NotificationBanner.jsx
import React from 'react';

const NotificationBanner = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="notification-banner">
      <div className="container">
        <div className="notification-content">
          <i className="fas fa-info-circle" />
          <span>{notification}</span>
          <button onClick={onClose} className="notification-close">
            <i className="fas fa-times" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
