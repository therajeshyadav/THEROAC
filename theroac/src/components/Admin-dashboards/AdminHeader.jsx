// src/components/admin/AdminDashboard/AdminHeader.jsx
import { TrendingUp, MessageSquare, LogOut, Menu, X } from "lucide-react";
import UniversalNotifications from "../common/UniversalNotifications";
import "./AdminHeader.css";

const AdminHeader = ({
  authUser,
  onLogout,
  onAvatarClick,
  getUserInitials,
  onNotificationClick,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="admin-organizer-header">
      <div className="admin-header-left">
        <button 
          className="admin-mobile-menu-toggle"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
