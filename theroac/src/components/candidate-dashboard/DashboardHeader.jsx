// src/components/candidate-dashboard/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = ({ activeTab, setActiveTab, authUser, logout }) => {
  return (
    <header className="candidate-header">
      <div className="header-content">
        <div className="header-left">
          <div
            className="logo-section"
            onClick={() => (window.location.href = '/')}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="assets/img/logo/logo5.png"
              alt="ROAC Logo"
              className="dashboard-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <i className="fas fa-briefcase" />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-search" />
            <span>Find Jobs</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fas fa-file-alt" />
            <span>Applications</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i className="fas fa-calendar" />
            <span>Events</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'prime-hub' ? 'active' : ''}`}
            onClick={() => setActiveTab('prime-hub')}
          >
            <i className="fas fa-star" />
            <span>ROAC Prime</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user" />
            <span>Profile</span>
          </button>
        </nav>

        <div className="header-right">
          <div className="header-actions">
            <button className="notification-btn">
              <i className="fas fa-bell" />
            </button>
            <div className="user-menu">
              <div
                className="user-avatar"
                onClick={() => setActiveTab('profile')}
                style={{ cursor: 'pointer' }}
                title="View Profile"
              >
                {authUser?.profilePicture || authUser?.avatar ? (
                  <img
                    src={authUser.profilePicture || authUser.avatar}
                    alt={authUser.fullName || authUser.name || 'User'}
                    className="profile-image"
                  />
                ) : (
                  <span className="profile-initials">
                    {(authUser?.fullName || authUser?.name)?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="user-name">
                {authUser?.fullName || authUser?.name || 'User'}
              </span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
            >
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
