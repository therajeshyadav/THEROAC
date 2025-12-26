// src/components/admin/AdminDashboard/AdminHeader.jsx
import { TrendingUp, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import UniversalNotifications from "../common/UniversalNotifications";
import "./AdminHeader.css";

const AdminHeader = ({
  authUser,
  onLogout,
  onAvatarClick,
  getUserInitials,
  onNotificationClick,
  activeTab,
  setActiveTab,
  navItems
}) => {
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

  return (
    <>
      {/* Desktop Header */}
      <header className="admin-organizer-header d-none d-lg-flex">
        <div className="admin-header-left">
          <div
            className="admin-logo-section"
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src="assets/img/logo/logo5.png"
              alt="ROAC Logo"
              className="admin-dashboard-logo"
            />
          </div>
        </div>

        <div className="admin-header-center">
          <h1 className="admin-panel-title">Admin Panel</h1>
        </div>

        <div className="admin-header-right">
          <div className="admin-header-actions">
            <button className="admin-notification-btn">
              <TrendingUp className="w-4 h-4" />
              <span className="ml-2">System</span>
            </button>
            <button className="admin-notification-btn">
              <MessageSquare className="w-5 h-5" />
            </button>
            <UniversalNotifications onNotificationClick={onNotificationClick} />
            <div className="admin-user-profile">
              <div
                className="admin-user-avatar"
                onClick={onAvatarClick}
                title="View Profile"
              >
                {authUser?.profilePicture || authUser?.avatar ? (
                  <img
                    src={authUser.profilePicture || authUser.avatar}
                    alt={authUser.name || authUser.fullName || "Admin"}
                    className="profile-image"
                  />
                ) : (
                  <span className="profile-initials">
                    {getUserInitials(authUser?.name || authUser?.fullName)}
                  </span>
                )}
              </div>
            </div>
            <button
              className="admin-logout-btn"
              onClick={onLogout}
              title="Logout"
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
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header - Exactly like Candidate Dashboard */}
      <div className="mobile-header mobile-haeder10 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <a href="/">
                  <img src="assets/img/logo/logo5.png" alt="ROAC Logo" />
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

      {/* Mobile Sidebar - Exactly like Candidate Dashboard */}
      <div
        className={`mobile-sidebar mobile-sidebar10 ${
          mobileMenuOpen ? "mobile-menu-active" : ""
        }`}
      >
        <div className="logosicon-area">
          <div className="logos">
            <img src="assets/img/logo/logo5.png" alt="ROAC Logo" />
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
                    alt={authUser.name || authUser.fullName || "Admin"}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  getUserInitials(authUser?.name || authUser?.fullName)
                )}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: "600", fontSize: "0.9rem" }}>
                  {authUser?.name || authUser?.fullName || "Admin"}
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
                  Admin Panel
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="mobile-nav-list nav-list1">
            {navItems && navItems.map((item) => (
              <li key={item.id}>
                <a href="#" onClick={() => handleTabChange(item.id)}>
                  <item.icon className="w-4 h-4" style={{ marginRight: "0.5rem" }} />
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#" onClick={() => handleTabChange('settings')}>
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

export default AdminHeader;
