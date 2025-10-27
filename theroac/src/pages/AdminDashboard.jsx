import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
// import DashboardHeader from '../components/DashboardHeader';
// import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || authUser?.role !== 'admin') {
            navigate('/login');
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
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const usersData = await apiService.getAdminUsers();
            setUsers(usersData.users || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadJobs = async () => {
        try {
            const jobsData = await apiService.request('/admin/jobs');
            setJobs(jobsData.jobs || []);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        }
    };

    const loadEvents = async () => {
        try {
            const eventsData = await apiService.request('/admin/events');
            setEvents(eventsData.events || []);
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const updateUserStatus = async (userId, status) => {
        try {
            await apiService.request(`/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            loadUsers(); // Refresh users list
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-background"></div>
                <div className="loading-container">
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="preloader">
                <div className="loading-container">
                <div className="loading"></div>
                <div id="loading-icon">
                    <img src="assets/img/logo/preloader.png" alt="" />
                </div>
                </div>
            </div>
            <div className="paginacontainer">
                <div className="progress-wrap warp2">
                <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                    <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                </svg>
                </div>
            </div> 
            <div className="dashboard-background"></div>

            {/* Dashboard Header with Navigation */}
            {/* <DashboardHeader
                user={authUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isAdmin={true}
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'users') loadUsers();
                    if (tab === 'jobs') loadJobs();
                    if (tab === 'events') loadEvents();
                }}
            /> */}

            {/* Dashboard Content */}
            <div className="dashboard-content">
                <div className="container">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && dashboardStats && (
                        <div className="tab-content">
                            {/* Stats Cards */}
                            <div className="row mb-4">
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <div className="admin-stat-card">
                                        <div className="stat-icon" style={{ backgroundColor: '#4CAF50' }}>
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>{dashboardStats.overview.totalUsers}</h3>
                                            <p>Total Users</p>
                                            <span className="growth">+{dashboardStats.growth.newUsers} this month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <div className="admin-stat-card">
                                        <div className="stat-icon" style={{ backgroundColor: '#2196F3' }}>
                                            <i className="fas fa-briefcase"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>{dashboardStats.overview.activeJobs}</h3>
                                            <p>Active Jobs</p>
                                            <span className="growth">+{dashboardStats.growth.newJobs} this month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <div className="admin-stat-card">
                                        <div className="stat-icon" style={{ backgroundColor: '#FF9800' }}>
                                            <i className="fas fa-calendar"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>{dashboardStats.overview.totalEvents}</h3>
                                            <p>Total Events</p>
                                            <span className="growth">+{dashboardStats.growth.newEvents} this month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <div className="admin-stat-card">
                                        <div className="stat-icon" style={{ backgroundColor: '#9C27B0' }}>
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>{dashboardStats.overview.totalApplications}</h3>
                                            <p>Applications</p>
                                            <span className="growth">+{dashboardStats.growth.newApplications} this month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Breakdown */}
                            <div className="row mb-4">
                                <div className="col-lg-8">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Platform Overview</h4>
                                        </div>
                                        <div className="overview-grid">
                                            <div className="overview-item">
                                                <div className="overview-number">{dashboardStats.overview.totalCandidates}</div>
                                                <div className="overview-label">Candidates</div>
                                            </div>
                                            <div className="overview-item">
                                                <div className="overview-number">{dashboardStats.overview.totalRecruiters}</div>
                                                <div className="overview-label">Recruiters</div>
                                            </div>
                                            <div className="overview-item">
                                                <div className="overview-number">{dashboardStats.overview.totalJobs}</div>
                                                <div className="overview-label">Total Jobs</div>
                                            </div>
                                            <div className="overview-item">
                                                <div className="overview-number">{dashboardStats.overview.pendingUsers}</div>
                                                <div className="overview-label">Pending Users</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Quick Actions</h4>
                                        </div>
                                        <div className="quick-actions">
                                            <button className="action-btn" onClick={() => setActiveTab('users')}>
                                                <i className="fas fa-users"></i> Manage Users
                                            </button>
                                            <button className="action-btn" onClick={() => setActiveTab('jobs')}>
                                                <i className="fas fa-briefcase"></i> Review Jobs
                                            </button>
                                            <button className="action-btn" onClick={() => setActiveTab('events')}>
                                                <i className="fas fa-calendar"></i> Manage Events
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>User Management</h4>
                                    <div className="header-actions">
                                        <button className="btn-filter">
                                            <i className="fas fa-filter"></i> Filter
                                        </button>
                                    </div>
                                </div>
                                <div className="users-table">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.fullName}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.role}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${user.status}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {user.status === 'active' ? (
                                                                <button
                                                                    className="btn-action ban"
                                                                    onClick={() => updateUserStatus(user.id, 'banned')}
                                                                >
                                                                    Ban
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn-action activate"
                                                                    onClick={() => updateUserStatus(user.id, 'active')}
                                                                >
                                                                    Activate
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Jobs Tab */}
                    {activeTab === 'jobs' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>Job Management</h4>
                                </div>
                                <div className="jobs-grid">
                                    {jobs.map(job => (
                                        <div key={job.id} className="admin-job-card">
                                            <div className="job-header">
                                                <h5>{job.title}</h5>
                                                <span className={`status-badge ${job.status}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="company">{job.companyName}</p>
                                            <div className="job-meta">
                                                <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                                                <span>By: {job.recruiter?.fullName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>Event Management</h4>
                                </div>
                                <div className="events-grid">
                                    {events.map(event => (
                                        <div key={event.id} className="admin-event-card">
                                            <div className="event-header">
                                                <h5>{event.title}</h5>
                                                <span className={`status-badge ${event.status}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <div className="event-meta">
                                                <span>Date: {new Date(event.startDate).toLocaleDateString()}</span>
                                                <span>Organizer: {event.organizer?.fullName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>Platform Analytics</h4>
                                </div>
                                <div className="analytics-placeholder">
                                    <i className="fas fa-chart-line"></i>
                                    <h3>Analytics Dashboard</h3>
                                    <p>Advanced analytics and reporting features coming soon!</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;