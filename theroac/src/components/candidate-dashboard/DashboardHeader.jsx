// src/components/candidate-dashboard/DashboardHeader.jsx
import React, { useState } from 'react';
import UniversalNotifications from '../common/UniversalNotifications';

const DashboardHeader = ({ activeTab, setActiveTab, authUser, logout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="candidate-header d-none d-lg-flex">
        <div className="header-content">
          <div className="header-left">
            <div
              className="logo-section"
              onClick={() => (window.location.href = '/')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`${window.location.origin}/assets/img/logo/logo5.png`}
                alt="ROAC Logo"
                className="dashboard-logo"
                onError={(e) => {
                  console.error('Logo failed to load:', e.target.src);
                  // Try fallback
                  e.target.src = '/logo.png';
                }}
              />
            </div>
          </div>

          <nav className="header-nav">
            <button
              className={`navBtn ${activeTab === 'internships' ? 'active' : ''}`}
              onClick={() => setActiveTab('internships')}
            >
              <i className="fas fa-briefcase" />
              <span>Dashboard</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <i className="fas fa-search" />
              <span>Find Jobs</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <i className="fas fa-file-alt" />
              <span>Applications</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <i className="fas fa-calendar" />
              <span>Events</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'prime-hub' ? 'active' : ''}`}
              onClick={() => setActiveTab('prime-hub')}
            >
              <i className="fas fa-star" />
              <span>ROAC Prime</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'saved-items' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved-items')}
            >
              <i className="fas fa-heart" />
              <span>Saved Items</span>
            </button>
            <button
              className={`navBtn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user" />
              <span>Profile</span>
            </button>
          </nav>

          <div className="header-right">
            <div className="header-actions">
              <UniversalNotifications />
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
                      {getUserInitials(authUser?.fullName || authUser?.name)}
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
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease"
                }}
              >
                <i className="fas fa-sign-out-alt" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Exactly like Landing Page */}
      <div className="mobile-header mobile-haeder10 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <a href="/">
                  <img src={`${window.location.origin}/assets/img/logo/logo5.png`} alt="ROAC Logo" />
                </a>
              </div>
              <div
                className="mobile-nav-icon dots-menu"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <i className="fa-solid fa-xmark"></i>
                ) : (
                  <i className="fa-solid fa-bars-staggered"></i>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Exactly like Landing Page */}
      <div
        className={`mobile-sidebar mobile-sidebar10 ${
          mobileMenuOpen ? "mobile-menu-active" : ""
        }`}
      >
        <div className="logosicon-area">
          <div className="logos">
            <img src={`${window.location.origin}/assets/img/logo/logo5.png`} alt="ROAC Logo" />
          </div>
          <div className="menu-close" onClick={closeMobileMenu}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="mobile-nav mobile-nav1">
          {/* User Profile Section */}
          <div className="mobile-user-section" style={{
            padding: "1rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "1rem"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem"
            }}>
              <div
                className="user-avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#ffd600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontWeight: "600"
                }}
              >
                {authUser?.profilePicture || authUser?.avatar ? (
                  <img
                    src={authUser.profilePicture || authUser.avatar}
                    alt={authUser.fullName || authUser.name || 'User'}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  getUserInitials(authUser?.fullName || authUser?.name)
                )}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: "600", fontSize: "0.9rem" }}>
                  {authUser?.fullName || authUser?.name || "User"}
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
                  Candidate Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="mobile-nav-list nav-list1">
            <li>
              <a href="#" onClick={() => handleTabChange('internships')}>
                <i className="fa-solid fa-briefcase" style={{ marginRight: "0.5rem" }}></i>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('jobs')}>
                <i className="fa-solid fa-search" style={{ marginRight: "0.5rem" }}></i>
                Find Jobs
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('applications')}>
                <i className="fa-solid fa-file-alt" style={{ marginRight: "0.5rem" }}></i>
                Applications
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('events')}>
                <i className="fa-solid fa-calendar" style={{ marginRight: "0.5rem" }}></i>
                Events
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('prime-hub')}>
                <i className="fa-solid fa-star" style={{ marginRight: "0.5rem" }}></i>
                ROAC Prime
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('saved-items')}>
                <i className="fa-solid fa-heart" style={{ marginRight: "0.5rem" }}></i>
                Saved Items
              </a>
            </li>
            <li>
              <a href="#" onClick={() => handleTabChange('profile')}>
                <i className="fa-solid fa-user" style={{ marginRight: "0.5rem" }}></i>
                Profile
              </a>
            </li>
          </ul>
          
          {/* Action Buttons */}
          <div className="allmobilesection">
            <button 
              className="vl-btn10 dashboard-btn" 
              onClick={() => {
                window.location.href = "/";
                closeMobileMenu();
              }}
            >
              <span className="demo">
                Go to Home <i className="fa-solid fa-home"></i>
              </span>
            </button>
            <div className="space16"></div>
            <button 
              className="vl-btn10 logout-btn" 
              onClick={() => {
                logout();
                window.location.href = '/';
                closeMobileMenu();
              }}
            >
              <span className="demo">
                Logout <i className="fa-solid fa-sign-out-alt"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
