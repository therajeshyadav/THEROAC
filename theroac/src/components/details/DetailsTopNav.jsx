// src/components/DetailsTopNav.jsx
import React from "react";
import UniversalNotifications from "../common/UniversalNotifications";

const DetailsTopNav = ({
  isHeaderSticky,
  tabs,
  activeTab,
  onTabClick,
  isAuthenticated,
  user,
  onDashboardClick,
  onLogout,
  onLogin,
  onSignup,
}) => {
  return (
    <div className={`top-nav visible ${isHeaderSticky ? "sticky" : ""}`}>
      <div className="nav-container">
        <div className="nav-left">
          <div
            className="site-logo"
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" />
          </div>

          {/* Tabs only when sticky */}
          {isHeaderSticky && (
            <div className="nav-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => onTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          <div className="nav-right-content">
            {isAuthenticated && user && (
              <div className="notification-section">
                <UniversalNotifications />
              </div>
            )}
            
            {isAuthenticated && user ? (
              <div className="auth-buttons">
                <button className="dashboard-btn" onClick={onDashboardClick}>
                  Dashboard
                </button>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={onLogin}>
                  Login
                </button>
                <button className="signup-btn" onClick={onSignup}>
                  Join as Recruiter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsTopNav;
