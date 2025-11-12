import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreloader } from "../hooks/usePreloader";
import apiService from "../services/api";

import {
    Users,
    Briefcase,
    Calendar,
    UserCheck,
    Bell,
    Settings,
    Download,
    TrendingUp,
    MessageSquare,
    LogOut,
    Grid,
    BarChart3,
    Shield,
    Activity
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [notifications] = useState(5);
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        bio: ''
    });
    const preloaderVisible = usePreloader(300);


    // Navigation items for sidebar
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: Grid },
        { id: "users", label: "Users", icon: Users },
        { id: "jobs", label: "Jobs", icon: Briefcase },
        { id: "events", label: "Events", icon: Calendar },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
    ];

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name) return "A";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            // Logout failed
        }
    };

    // Get stats data for cards
    const getStatsData = () => {
        if (!dashboardStats) return [];

        return [
            {
                title: "Total Users",
                value: dashboardStats.overview?.totalUsers || 0,
                icon: Users,
                color: "blue",
                details: [
                    { label: "New this month", value: `+${dashboardStats.growth?.newUsers || 0}` },
                    { label: "Active", value: dashboardStats.overview?.totalCandidates + dashboardStats.overview?.totalRecruiters || 0 }
                ]
            },
            {
                title: "Active Jobs",
                value: dashboardStats.overview?.activeJobs || 0,
                icon: Briefcase,
                color: "pink",
                details: [
                    { label: "New this month", value: `+${dashboardStats.growth?.newJobs || 0}` },
                    { label: "Total Jobs", value: dashboardStats.overview?.totalJobs || 0 }
                ]
            },
            {
                title: "Total Events",
                value: dashboardStats.overview?.totalEvents || 0,
                icon: Calendar,
                color: "yellow",
                details: [
                    { label: "New this month", value: `+${dashboardStats.growth?.newEvents || 0}` },
                    { label: "Upcoming", value: dashboardStats.overview?.upcomingEvents || 0 }
                ]
            },
            {
                title: "Applications",
                value: dashboardStats.overview?.totalApplications || 0,
                icon: UserCheck,
                color: "orange",
                details: [
                    { label: "New this month", value: `+${dashboardStats.growth?.newApplications || 0}` },
                    { label: "Pending", value: dashboardStats.overview?.pendingApplications || 0 }
                ]
            }
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
            // Failed to load dashboard data
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const usersData = await apiService.getAdminUsers();
            setUsers(usersData.users || []);
        } catch (error) {
            // Failed to load users
        }
    };

    const loadJobs = async () => {
        try {
            const jobsData = await apiService.request("/admin/jobs");
            setJobs(jobsData.jobs || []);
        } catch (error) {
            // Failed to load jobs
        }
    };

    const loadEvents = async () => {
        try {
            const eventsData = await apiService.request("/admin/events");
            setEvents(eventsData.events || []);
        } catch (error) {
            // Failed to load events
        }
    };

    const updateUserStatus = async (userId, status) => {
        try {
            await apiService.request(`/admin/users/${userId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            loadUsers(); // Refresh users list
        } catch (error) {
            // Failed to update user status
        }
    };

    if (authLoading || loading) {
        return (
            <div className="admin-dashboard-container">
                <div className="admin-dashboard-background"></div>
                <div className="admin-loading-container">
                    <div className="admin-loading-spinner">
                        <div className="admin-spinner"></div>
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
                        <div className="loading"></div>
                        <div id="loading-icon">
                            <img src="assets/img/logo/preloader.png" alt="" />
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-organizer-panel">
                <div className="admin-dashboard-background"></div>

                {/* Top Header */}
                <div className="admin-organizer-header">
                    <div className="admin-header-left">
                        <div className="admin-logo-section">
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
                            <button className="admin-notification-btn">
                                <Bell className="w-5 h-5" />
                                {notifications > 0 && (
                                    <span className="admin-notification-badge">{notifications}</span>
                                )}
                            </button>
                            <div className="admin-user-profile">
                                <div className="admin-user-avatar">
                                    {authUser?.profilePicture || authUser?.avatar ? (
                                        <img 
                                            src={authUser.profilePicture || authUser.avatar} 
                                            alt={authUser.name || authUser.fullName || 'Admin'} 
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
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-organizer-content">
                    {/* Left Sidebar */}
                    <div
                        className={`admin-organizer-sidebar ${sidebarExpanded ? "admin-expanded" : ""}`}
                        onMouseEnter={() => setSidebarExpanded(true)}
                        onMouseLeave={() => setSidebarExpanded(false)}
                    >
                        <nav className="admin-sidebar-nav">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    className={`admin-nav-item ${activeTab === item.id ? "admin-active" : ""}`}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (item.id === "users") loadUsers();
                                        if (item.id === "jobs") loadJobs();
                                        if (item.id === "events") loadEvents();
                                    }}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="admin-sidebar-bottom">
                            <button className="admin-nav-item">
                                <Download className="w-5 h-5" />
                                <span>Reports</span>
                            </button>
                            <button 
                                className={`admin-nav-item ${activeTab === "settings" ? "admin-active" : ""}`}
                                onClick={() => setActiveTab("settings")}
                            >
                                <Settings className="w-5 h-5" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="admin-organizer-main">
                        <div className="admin-max-w-1200">
                            {/* Dashboard Tab */}
                            {activeTab === "dashboard" && dashboardStats && (
                                <div className="admin-tab-content">
                                    {/* Welcome Section */}
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

                                    {/* Stats Cards */}
                                    <div className="admin-stats-grid">
                                        {getStatsData().map((stat, index) => (
                                            <div
                                                key={index}
                                                className={`admin-stat-card ${stat.color} admin-enhanced-card`}
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

                                    {/* Analytics Dashboard Grid */}
                                    <div className="admin-dashboard-analytics-grid">
                                        {/* Platform Analytics Chart */}
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
                                                    <BarChart3 className="w-16 h-16 text-yellow-500 mb-4" />
                                                    <h4>Analytics Chart</h4>
                                                    <p>Platform analytics visualization will be displayed here</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Calendar */}
                                        <div className="admin-activity-calendar-section">
                                            <div className="admin-calendar-header">
                                                <h3>System Activity</h3>
                                                <p>Daily platform activity overview</p>
                                            </div>
                                            <div className="admin-activity-summary">
                                                <div className="admin-activity-item">
                                                    <div className="admin-activity-number">{dashboardStats.overview?.totalCandidates || 0}</div>
                                                    <div className="admin-activity-label">Candidates</div>
                                                </div>
                                                <div className="admin-activity-item">
                                                    <div className="admin-activity-number">{dashboardStats.overview?.totalRecruiters || 0}</div>
                                                    <div className="admin-activity-label">Recruiters</div>
                                                </div>
                                                <div className="admin-activity-item">
                                                    <div className="admin-activity-number">{dashboardStats.overview?.pendingUsers || 0}</div>
                                                    <div className="admin-activity-label">Pending</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === "users" && (
                                <div className="admin-tab-content">
                                    <div className="admin-enhanced-user-management">
                                        <div className="admin-user-management-header">
                                            <div className="admin-header-title">
                                                <h3>User Management</h3>
                                                <p>Manage and monitor all platform users</p>
                                            </div>
                                            <div className="admin-header-actions">
                                                <div className="admin-search-filter-container">
                                                    <div className="admin-search-box">
                                                        <Users className="w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search users..."
                                                            className="admin-search-input"
                                                        />
                                                    </div>
                                                    <select className="admin-filter-select">
                                                        <option value="">All Roles</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="recruiter">Recruiter</option>
                                                        <option value="candidate">Candidate</option>
                                                    </select>
                                                    <select className="admin-filter-select">
                                                        <option value="">All Status</option>
                                                        <option value="active">Active</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="banned">Banned</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="users-grid-container">
                                            {users.length === 0 ? (
                                                <div className="empty-state">
                                                    <Users className="w-16 h-16 text-yellow-500 mb-4" />
                                                    <h4>No Users Found</h4>
                                                    <p>No users match your current filters</p>
                                                </div>
                                            ) : (
                                                <div className="users-grid">
                                                    {users.map((user) => (
                                                        <div key={user.id} className="enhanced-user-card">
                                                            <div className="user-card-header">
                                                                <div className="user-avatar-section">
                                                                    <div className="user-avatar-large">
                                                                        {user.profilePicture || user.avatar ? (
                                                                            <img 
                                                                                src={user.profilePicture || user.avatar} 
                                                                                alt={user.fullName || 'User'} 
                                                                                className="profile-image"
                                                                            />
                                                                        ) : (
                                                                            <span className="profile-initials">
                                                                                {getUserInitials(user.fullName)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="user-basic-info">
                                                                        <h4 className="user-name">{user.fullName}</h4>
                                                                        <p className="user-email">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="user-status-badges">
                                                                    <span className={`enhanced-role-badge ${user.role}`}>
                                                                        {user.role}
                                                                    </span>
                                                                    <span className={`enhanced-status-badge ${user.status}`}>
                                                                        {user.status}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="user-card-body">
                                                                <div className="user-stats">
                                                                    <div className="user-stat-item">
                                                                        <span className="stat-label">Joined</span>
                                                                        <span className="stat-value">
                                                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="user-stat-item">
                                                                        <span className="stat-label">Last Login</span>
                                                                        <span className="stat-value">
                                                                            {user.lastLogin ?
                                                                                new Date(user.lastLogin).toLocaleDateString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                }) :
                                                                                'Never'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {user.phone && (
                                                                        <div className="user-stat-item">
                                                                            <span className="stat-label">Phone</span>
                                                                            <span className="stat-value">{user.phone}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="user-card-footer">
                                                                <div className="user-actions">
                                                                    <button className="action-btn view-btn">
                                                                        <UserCheck className="w-4 h-4" />
                                                                        View Profile
                                                                    </button>
                                                                    {user.status === "active" ? (
                                                                        <button
                                                                            className="action-btn ban-btn"
                                                                            onClick={() => updateUserStatus(user.id, "banned")}
                                                                        >
                                                                            <Shield className="w-4 h-4" />
                                                                            Ban User
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="action-btn activate-btn"
                                                                            onClick={() => updateUserStatus(user.id, "active")}
                                                                        >
                                                                            <UserCheck className="w-4 h-4" />
                                                                            Activate
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Statistics Summary */}
                                        <div className="user-stats-summary">
                                            <div className="stats-summary-card">
                                                <div className="summary-stat">
                                                    <span className="summary-number">{users.filter(u => u.status === 'active').length}</span>
                                                    <span className="summary-label">Active Users</span>
                                                </div>
                                                <div className="summary-stat">
                                                    <span className="summary-number">{users.filter(u => u.status === 'pending').length}</span>
                                                    <span className="summary-label">Pending</span>
                                                </div>
                                                <div className="summary-stat">
                                                    <span className="summary-number">{users.filter(u => u.status === 'banned').length}</span>
                                                    <span className="summary-label">Banned</span>
                                                </div>
                                                <div className="summary-stat">
                                                    <span className="summary-number">{users.length}</span>
                                                    <span className="summary-label">Total Users</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Jobs Tab */}
                            {activeTab === "jobs" && (
                                <div className="tab-content">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Job Management</h4>
                                        </div>
                                        <div className="jobs-grid">
                                            {jobs.map((job) => (
                                                <div key={job.id} className="admin-job-card">
                                                    <div className="job-header">
                                                        <h5>{job.title}</h5>
                                                        <span className={`status-badge ${job.status}`}>
                                                            {job.status}
                                                        </span>
                                                    </div>
                                                    <p className="company">{job.companyName}</p>
                                                    <div className="job-meta">
                                                        <span>
                                                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span>By: {job.recruiter?.fullName}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Events Tab */}
                            {activeTab === "events" && (
                                <div className="tab-content">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Event Management</h4>
                                        </div>
                                        <div className="events-grid">
                                            {events.map((event) => (
                                                <div key={event.id} className="admin-event-card">
                                                    <div className="event-header">
                                                        <h5>{event.title}</h5>
                                                        <span className={`status-badge ${event.status}`}>
                                                            {event.status}
                                                        </span>
                                                    </div>
                                                    <div className="event-meta">
                                                        <span>
                                                            Date: {new Date(event.startDate).toLocaleDateString()}
                                                        </span>
                                                        <span>Organizer: {event.organizer?.fullName}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === "analytics" && (
                                <div className="tab-content">
                                    <div className="analytics-placeholder">
                                        <BarChart3 className="w-16 h-16 text-yellow-500 mb-4" />
                                        <h3>Advanced Analytics</h3>
                                        <p>Comprehensive analytics and reporting features coming soon!</p>
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === "settings" && (
                                <div className="settings-section">
                                    <div className="section-header" style={{ marginBottom: '2rem' }}>
                                        <div className="header-left">
                                            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                                                Profile Settings
                                            </h2>
                                            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0 0 0' }}>
                                                Manage your admin profile information
                                            </p>
                                        </div>
                                    </div>

                                    <div className="profile-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: '20px', padding: '2rem', maxWidth: '800px' }}>
                                        {/* Profile Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="admin-user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                                {authUser?.profilePicture ? (
                                                    <img src={authUser.profilePicture} alt={authUser.fullName} className="profile-image" />
                                                ) : (
                                                    <span className="profile-initials">
                                                        {getUserInitials(authUser?.fullName || authUser?.name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                                                    {authUser?.fullName || authUser?.name || 'Admin User'}
                                                </h3>
                                                <span style={{ color: 'rgba(255,214,0,0.9)', fontSize: '0.9rem', background: 'rgba(255,214,0,0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', display: 'inline-block' }}>
                                                    Admin
                                                </span>
                                            </div>
                                            {!isEditingProfile && (
                                                <button 
                                                    className="admin-btn-host"
                                                    onClick={() => {
                                                        setProfileData({
                                                            fullName: authUser?.fullName || authUser?.name || '',
                                                            email: authUser?.email || '',
                                                            phone: authUser?.phone || '',
                                                            city: authUser?.city || '',
                                                            state: authUser?.state || '',
                                                            country: authUser?.country || '',
                                                            bio: authUser?.bio || ''
                                                        });
                                                        setIsEditingProfile(true);
                                                    }}
                                                >
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>

                                        {/* Profile Form */}
                                        {isEditingProfile ? (
                                            <div className="profile-form">
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            Full Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.fullName}
                                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={profileData.email}
                                                            readOnly
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            Phone
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={profileData.phone}
                                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.city}
                                                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            State
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.state}
                                                            onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                            Country
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.country}
                                                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        Bio
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        rows="4"
                                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => setIsEditingProfile(false)}
                                                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '600' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="admin-btn-host"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await fetch('http://localhost:4000/api/users/me', {
                                                                    method: 'PUT',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                                    },
                                                                    body: JSON.stringify(profileData)
                                                                });
                                                                if (response.ok) {
                                                                    setIsEditingProfile(false);
                                                                    alert('Profile updated successfully!');
                                                                    window.location.reload();
                                                                } else {
                                                                    alert('Failed to update profile');
                                                                }
                                                            } catch (error) {
                                                                alert('Failed to update profile');
                                                            }
                                                        }}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="profile-view">
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            Full Name
                                                        </label>
                                                        <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                                                            {authUser?.fullName || authUser?.name || 'Not set'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            Email
                                                        </label>
                                                        <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                                                            {authUser?.email || 'Not set'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            Phone
                                                        </label>
                                                        <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                                                            {authUser?.phone || 'Not set'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            Location
                                                        </label>
                                                        <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                                                            {[authUser?.city, authUser?.state, authUser?.country].filter(Boolean).join(', ') || 'Not set'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {authUser?.bio && (
                                                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            Bio
                                                        </label>
                                                        <p style={{ color: '#fff', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
                                                            {authUser.bio}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="admin-organizer-right-panel">
                        <div className="admin-right-panel-content">
                            {/* Customization Card */}
                            <div className="customize-card">
                                <div className="customize-header">
                                    <div className="customize-text">
                                        <h3>Admin Control Center</h3>
                                        <p>Manage your platform settings and configurations from here.</p>
                                    </div>
                                    <div className="customize-logo">
                                        <span>A</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="right-panel-section">
                                <h4>Quick Overview</h4>
                                {dashboardStats && (
                                    <div className="quick-stats">
                                        <div className="quick-stat-item">
                                            <span className="quick-stat-label">Total Users</span>
                                            <span className="quick-stat-value">{dashboardStats.overview?.totalUsers || 0}</span>
                                        </div>
                                        <div className="quick-stat-item">
                                            <span className="quick-stat-label">Active Jobs</span>
                                            <span className="quick-stat-value">{dashboardStats.overview?.activeJobs || 0}</span>
                                        </div>
                                        <div className="quick-stat-item">
                                            <span className="quick-stat-label">Total Events</span>
                                            <span className="quick-stat-value">{dashboardStats.overview?.totalEvents || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* System Status */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
