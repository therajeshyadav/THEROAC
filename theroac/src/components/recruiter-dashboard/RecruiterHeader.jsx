import {
  LogOut,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import UniversalNotifications from "../common/UniversalNotifications";

const RecruiterHeader = ({
  authUser,
  notifications,
  onLogout,
  onOpenSettings,
  getUserInitials
}) => {
  return (
    <div className="organizer-header">
      <div className="header-left">
        <div
          className="logo-section"
          onClick={() => (window.location.href = "/")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="assets/img/logo/logo5.png"
            alt="ROAC Logo"
            className="dashboard-logo"
          />
        </div>
      </div>

      <div className="header-center">
        <h1 className="panel-title">Organizer Panel</h1>
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
              className="user-avatar"
              onClick={onOpenSettings}
              style={{ cursor: "pointer" }}
            >
              {authUser?.profilePicture || authUser?.avatar ? (
                <img
                  src={authUser.profilePicture || authUser.avatar}
                  alt={authUser?.fullName}
                  className="profile-image"
                />
              ) : (
                <span className="profile-initials">
                  {getUserInitials(authUser?.name || authUser?.fullName)}
                </span>
              )}
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterHeader;
