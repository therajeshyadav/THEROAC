// src/components/admin/AdminDashboard/AdminRightPanel.jsx
import "./AdminRightPanel.css";

const AdminRightPanel = ({ dashboardStats }) => {
  return (
    <aside className="admin-organizer-right-panel">
      <div className="admin-right-panel-content">
        <div className="customize-card">
          <div className="customize-header">
            <div className="customize-text">
              <h3>Admin Control Center</h3>
              <p>
                Manage your platform settings and configurations from here.
              </p>
            </div>
            <div className="customize-logo">
              <span>A</span>
            </div>
          </div>
        </div>

        <div className="right-panel-section">
          <h4>Quick Overview</h4>
          {dashboardStats && (
            <div className="quick-stats">
              <div className="quick-stat-item">
                <span className="quick-stat-label">Total Users</span>
                <span className="quick-stat-value">
                  {dashboardStats.overview?.totalUsers || 0}
                </span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-label">Active Jobs</span>
                <span className="quick-stat-value">
                  {dashboardStats.overview?.activeJobs || 0}
                </span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-label">Total Events</span>
                <span className="quick-stat-value">
                  {dashboardStats.overview?.totalEvents || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel-section">
          <h4>System Status</h4>
          <div className="system-status">
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>Database</span>
            </div>
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>API Services</span>
            </div>
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>Email Service</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminRightPanel;
