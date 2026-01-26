import {
  LogOut,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import UniversalNotifications from "../common/UniversalNotifications";

const RecruiterHeader = ({
  authUser,
  notifications,
  onLogout,
  onOpenSettings,
  getUserInitials
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="organizer-header d-none d-lg-flex">
        <div className="header-left">
          <div
            className="logo-section"
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/assets/img/logo/logo5.png"
              alt="ROAC Logo"
              className="dashboard-logo header-logo"
            />
          </div>
        </div>

        <div className="header-center">
          <h1 className="panel-title header-title">Organizer Panel</h1>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button className="notification-btn">
              <TrendingUp className="w-4 h-4" />
              <span className="ml-2">Upgrade</span>
            </button>

            <button className="notification-btn">
              <MessageSquare className="w-5 h-5" />
            </button>

            <UniversalNotifications />

            <div className="user-profile">
              <div
                className="user-avatar header-user-avatar"
                onClick={onOpenSettings}
                style={{ cursor: "pointer" }}
              >
                {getUserInitials(authUser?.fullName)}
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={onLogout}
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
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - Exactly like Landing Page */}
      <div className="mobile-header mobile-haeder10 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <a href="/">
                  <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" />
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
            <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" />
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
                {getUserInitials(authUser?.fullName)}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: "600", fontSize: "0.9rem" }}>
                  {authUser?.fullName || "User"}
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
                  Organizer Panel
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="mobile-nav-list nav-list1">
            <li>
              <a href="/recruiter-dashboard" onClick={closeMobileMenu}>
                <i className="fa-solid fa-tachometer-alt" style={{ marginRight: "0.5rem" }}></i>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=evaluate" onClick={closeMobileMenu}>
                <i className="fa-solid fa-user-check" style={{ marginRight: "0.5rem" }}></i>
                Evaluate Events
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=jobs" onClick={closeMobileMenu}>
                <i className="fa-solid fa-briefcase" style={{ marginRight: "0.5rem" }}></i>
                Jobs & Internships
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=team" onClick={closeMobileMenu}>
                <i className="fa-solid fa-users" style={{ marginRight: "0.5rem" }}></i>
                Team Management
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=events" onClick={closeMobileMenu}>
                <i className="fa-solid fa-calendar" style={{ marginRight: "0.5rem" }}></i>
                Events
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=talent" onClick={closeMobileMenu}>
                <i className="fa-solid fa-users-cog" style={{ marginRight: "0.5rem" }}></i>
                Talent Pipeline
              </a>
            </li>
            <li>
              <a href="/recruiter-dashboard?tab=settings" onClick={closeMobileMenu}>
                <i className="fa-solid fa-cog" style={{ marginRight: "0.5rem" }}></i>
                Settings
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
                onLogout();
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

export default RecruiterHeader;