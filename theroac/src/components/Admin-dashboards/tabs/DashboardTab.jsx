// src/components/admin/AdminDashboard/tabs/DashboardTab.jsx
import { Shield, Activity, BarChart3 } from "lucide-react";
import "./DashboardTab.css";

const DashboardTab = ({ authUser, dashboardStats, getStatsData, onTabChange }) => {
  const stats = getStatsData();

  const handleCardClick = (title) => {
    if (!onTabChange) return;
    
    switch (title) {
      case "Total Users":
        onTabChange("users");
        break;
      case "Active Jobs":
        onTabChange("jobs");
        break;
      case "Total Events":
        onTabChange("events");
        break;
      case "Applications":
        onTabChange("applications");
        break;
      case "Pending Approvals":
        onTabChange("approvals");
        break;
      default:
        break;
    }
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-welcome-section">
        <div className="admin-welcome-text">
          <h2>Welcome back, {authUser?.fullName || "Admin"}!</h2>
          <p>Here's what's happening with your platform today.</p>
        </div>
        <div className="admin-welcome-actions">
          <button className="admin-btn-host">
            <Shield className="w-4 h-4" />
            System Status
          </button>
          <button className="admin-btn-help">
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`admin-stat-card admin-${stat.color} ${stat.clickable ? 'clickable' : ''}`}
            onClick={() => stat.clickable && handleCardClick(stat.title)}
            style={{ cursor: stat.clickable ? 'pointer' : 'default' }}
          >
            <div className="admin-stat-icon-row">
              <div className="admin-stat-icon">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="admin-stat-number">{stat.value}</div>
            </div>

            <div className="admin-stat-info">
              <div className="admin-stat-label">{stat.title}</div>
              {stat.details.map((detail, idx) => (
                <div key={idx} className="admin-stat-details">
                  <div>{detail.label}</div>
                  <div>{detail.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-analytics-grid">
        <div className="admin-analytics-chart-section">
          <div className="admin-chart-header">
            <div className="admin-chart-title-section">
              <h3>Platform Analytics Overview</h3>
              <p>Track platform growth and user engagement</p>
            </div>
            <div className="admin-chart-tabs">
              <button className="admin-chart-tab">Today</button>
              <button className="admin-chart-tab">Last week</button>
              <button className="admin-chart-tab">Last month</button>
              <button className="admin-chart-tab admin-active">Year</button>
            </div>
          </div>
          <div className="admin-analytics-chart-container">
            <div className="admin-chart-placeholder">
              <BarChart3 className="w-16 h-16 mb-4" />
              <h4>Analytics Chart</h4>
              <p>Platform analytics visualization will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="admin-activity-calendar-section">
          <div className="admin-calendar-header">
            <h3>System Activity</h3>
            <p>Daily platform activity overview</p>
          </div>
          <div className="admin-activity-summary">
            <div className="admin-activity-item">
              <div className="admin-activity-number">
                {dashboardStats.overview?.totalCandidates || 0}
              </div>
              <div className="admin-activity-label">Candidates</div>
            </div>
            <div className="admin-activity-item">
              <div className="admin-activity-number">
                {dashboardStats.overview?.totalRecruiters || 0}
              </div>
              <div className="admin-activity-label">Recruiters</div>
            </div>
            <div className="admin-activity-item">
              <div className="admin-activity-number">
                {dashboardStats.overview?.pendingUsers || 0}
              </div>
              <div className="admin-activity-label">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardTab;
