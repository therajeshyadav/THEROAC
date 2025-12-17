// src/components/Admin-dashboards/AdminSidebar.jsx
import { useState } from "react";
import {
  Download,
  Settings,
} from "lucide-react";
import "./AdminSidebar.css";

const AdminSidebar = ({
  navItems,
  activeTab,
  setActiveTab,
  loadUsers,
  loadJobs,
  loadEvents,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (id === "users" && typeof loadUsers === "function") loadUsers();
    if (id === "jobs" && typeof loadJobs === "function") loadJobs();
    if (id === "events" && typeof loadEvents === "function") loadEvents();
  };

  return (
    <div
      className={`admin-organizer-sidebar ${
        sidebarExpanded ? "admin-expanded" : ""
      } ${mobileMenuOpen ? "mobile-open" : ""}`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-nav-item ${
                activeTab === item.id ? "admin-active" : ""
              }`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon className="admin-nav-icon" />
              <span className="admin-nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-bottom">
        <button className="admin-nav-item">
          <Download className="admin-nav-icon" />
          <span className="admin-nav-text">Reports</span>
        </button>
        <button
          className={`admin-nav-item ${
            activeTab === "settings" ? "admin-active" : ""
          }`}
          onClick={() => handleNavClick("settings")}
        >
          <Settings className="admin-nav-icon" />
          <span className="admin-nav-text">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
