// src/components/admin/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreloader } from "../hooks/usePreloader";
import { toast } from "react-toastify";
import apiService from "../services/api";

import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  FileText,
  Clock,
  XCircle,
} from "lucide-react";

import AdminHeader from "../components/Admin-dashboards/AdminHeader";
import AdminSidebar from "../components/Admin-dashboards/AdminSidebar";

import DashboardTab from "../components/Admin-dashboards/tabs/DashboardTab";
import UsersTab from "../components/Admin-dashboards/tabs/UsersTab";
import JobsTab from "../components/Admin-dashboards/tabs/JobsTab";
import EventsTab from "../components/Admin-dashboards/tabs/EventsTab";
import ApplicationsTab from "../components/Admin-dashboards/tabs/ApplicationsTab";
import PendingApprovalsTab from "../components/Admin-dashboards/tabs/PendingApprovalsTab";
import RejectedItemsTab from "../components/Admin-dashboards/tabs/RejectedItemsTab";
import AnalyticsTab from "../components/Admin-dashboards/tabs/AnalyticsTab";
import SettingsTab from "../components/Admin-dashboards/tabs/SettingsTab";



import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user: authUser,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "dashboard"
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(5);
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    bio: "",
  });

  const preloaderVisible = usePreloader(300);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "events", label: "Events", icon: Calendar },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "approvals", label: "Pending Approvals", icon: Clock },
    { id: "rejected", label: "Rejected Items", icon: XCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const getUserInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      // handle error
    }
  };

  const getStatsData = () => {
    if (!dashboardStats) return [];
    const pendingApprovals = (dashboardStats.overview?.pendingJobApprovals || 0) + (dashboardStats.overview?.pendingEventApprovals || 0);
    
    return [
      {
        title: "Total Users",
        value: dashboardStats.overview?.totalUsers || 0,
        icon: Users,
        color: "blue",
        clickable: true,
        details: [
          {
            label: "New this month",
            value: `+${dashboardStats.growth?.newUsers || 0}`,
          },
          {
            label: "Active",
            value:
              (dashboardStats.overview?.totalCandidates || 0) +
              (dashboardStats.overview?.totalRecruiters || 0),
          },
        ],
      },
      {
        title: "Active Jobs",
        value: dashboardStats.overview?.activeJobs || 0,
        icon: Briefcase,
        color: "pink",
        clickable: true,
        details: [
          {
            label: "New this month",
            value: `+${dashboardStats.growth?.newJobs || 0}`,
          },
          {
            label: "Total Jobs",
            value: dashboardStats.overview?.totalJobs || 0,
          },
        ],
      },
      {
        title: "Total Events",
        value: dashboardStats.overview?.totalEvents || 0,
        icon: Calendar,
        color: "yellow",
        clickable: true,
        details: [
          {
            label: "New this month",
            value: `+${dashboardStats.growth?.newEvents || 0}`,
          },
          {
            label: "Upcoming",
            value: dashboardStats.overview?.upcomingEvents || 0,
          },
        ],
      },
      {
        title: "Pending Approvals",
        value: pendingApprovals,
        icon: Clock,
        color: "orange",
        clickable: true,
        onClick: () => setActiveTab("approvals"),
        details: [
          {
            label: "Jobs",
            value: dashboardStats.overview?.pendingJobApprovals || 0,
          },
          {
            label: "Events",
            value: dashboardStats.overview?.pendingEventApprovals || 0,
          },
        ],
      },
    ];
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || authUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, authLoading, authUser, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await apiService.getAdminStats();
      setDashboardStats(statsData);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getAdminUsers({ limit: 20 });
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      // Show user-friendly error message
      if (error.message.includes('timeout')) {
        console.warn('Users data is taking longer to load. This may be due to a large dataset.');
      }
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await apiService.getAdminJobs({ limit: 20 });
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      if (error.message.includes('timeout')) {
        console.warn('Jobs data is taking longer to load. This may be due to a large dataset.');
      }
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await apiService.getAdminEvents({ limit: 20 });
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await apiService.updateUserStatus(userId, status);
      toast.success(`User status updated to ${status}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-background" />
        <div className="admin-loading-container">
          <div className="admin-loading-spinner">
            <div className="admin-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {preloaderVisible && (
        <div className="preloader">
          <div className="loading-container">
            <div className="loading" />
            <div id="loading-icon">
              <img src="assets/img/logo/preloader.png" alt="" />
            </div>
          </div>
        </div>
      )}

      <div className="admin-organizer-panel">
        <div className="admin-dashboard-background" />

        <AdminHeader
          authUser={authUser}
          onLogout={handleLogout}
          onAvatarClick={() => setActiveTab("settings")}
          onNotificationClick={setActiveTab}
          getUserInitials={getUserInitials}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="admin-mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="admin-organizer-content">
          <AdminSidebar
            navItems={navItems}
            activeTab={activeTab}
            setActiveTab={(id) => {
              setActiveTab(id);
              setMobileMenuOpen(false); // Close mobile menu when tab is selected
              if (id === "users") loadUsers();
              if (id === "jobs") loadJobs();
              if (id === "events") loadEvents();
            }}
            loadUsers={loadUsers}
            loadJobs={loadJobs}
            loadEvents={loadEvents}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="admin-organizer-main">
            <div className="admin-max-w-1200">
              {activeTab === "dashboard" && dashboardStats && (
                <DashboardTab
                  authUser={authUser}
                  dashboardStats={dashboardStats}
                  getStatsData={getStatsData}
                  onTabChange={setActiveTab}
                />
              )}

              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  getUserInitials={getUserInitials}
                  updateUserStatus={updateUserStatus}
                  currentAdminId={authUser?.id}
                />
              )}

              {activeTab === "jobs" && <JobsTab jobs={jobs} />}

              {activeTab === "events" && <EventsTab events={events} />}

              {activeTab === "applications" && <ApplicationsTab />}

              {activeTab === "approvals" && <PendingApprovalsTab />}

              {activeTab === "rejected" && <RejectedItemsTab />}

              {activeTab === "analytics" && <AnalyticsTab />}

              {activeTab === "settings" && (
                <SettingsTab
                  authUser={authUser}
                  isEditingProfile={isEditingProfile}
                  setIsEditingProfile={setIsEditingProfile}
                  profileData={profileData}
                  setProfileData={setProfileData}
                  getUserInitials={getUserInitials}
                />
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
