import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { usePreloader } from '../hooks/usePreloader';
import './CandidateDashboard.css';
// import DashboardHeader from '../components/DashboardHeader';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('internships');
    const [notification, setNotification] = useState('');
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalApplications: 0,
        availableJobs: 0,
        upcomingEvents: 0,
        profileViews: 0,
        statusCounts: {},
        candidateEventRegistrations: 0,
        recentApplications: []
    });
    const [loading, setLoading] = useState(true);
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
    const preloaderVisible = usePreloader(300); // Hide preloader after 300ms

    useEffect(() => {
        console.log('🎯 CandidateDashboard useEffect triggered', { authLoading, isAuthenticated, user: authUser });

        if (authLoading) {
            console.log('⏳ Auth still loading, waiting...');
            return;
        }

        if (!isAuthenticated) {
            console.log('🚫 Not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        console.log('✅ Authenticated, loading dashboard data');

        // Set up timeout before loading data
        const loadingTimeout = setTimeout(() => {
            console.warn('⚠️ Dashboard loading timeout - forcing completion');
            setLoading(false);
            setNotification('Dashboard loaded with limited functionality. Please refresh if needed.');
        }, 5000);

        // Load data and clear timeout on success
        loadDashboardData().finally(() => {
            clearTimeout(loadingTimeout);
        });

        return () => clearTimeout(loadingTimeout);
    }, [isAuthenticated, authLoading, navigate]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading dashboard data...');
            
            const [jobsData, eventsData, applicationsData, statsData] = await Promise.allSettled([
                apiService.getJobs().catch((error) => {
                    console.warn('Jobs API failed:', error);
                    return { jobs: [] };
                }),
                apiService.getEvents().catch((error) => {
                    console.warn('Events API failed:', error);
                    return { events: [] };
                }),
                apiService.getUserApplications().catch((error) => {
                    console.warn('Applications API failed:', error);
                    return { applications: [] };
                }),
                apiService.getCandidateStats().catch((error) => {
                    console.warn('Stats API failed:', error);
                    return {
                        totalApplications: 0,
                        availableJobs: 0,
                        upcomingEvents: 0,
                        profileViews: 0,
                        statusCounts: {},
                        candidateEventRegistrations: 0,
                        recentApplications: []
                    };
                })
            ]);

            // Handle results from Promise.allSettled
            setJobs(jobsData.status === 'fulfilled' ? (jobsData.value.jobs || []) : []);
            setEvents(eventsData.status === 'fulfilled' ? (eventsData.value.events || []) : []);
            setApplications(applicationsData.status === 'fulfilled' ? (applicationsData.value.applications || []) : []);
            setDashboardStats(statsData.status === 'fulfilled' ? statsData.value : {
                totalApplications: 0,
                availableJobs: 0,
                upcomingEvents: 0,
                profileViews: 0,
                statusCounts: {},
                candidateEventRegistrations: 0,
                recentApplications: []
            });

            // Only show notification if any requests failed
            const failedRequests = [jobsData, eventsData, applicationsData, statsData].filter(result => result.status === 'rejected');
            if (failedRequests.length > 0) {
                setNotification('Some data could not be loaded. Working in offline mode.');
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setNotification('Failed to load dashboard data. Working in offline mode.');
            // Set empty arrays as fallback
            setJobs([]);
            setEvents([]);
            setApplications([]);
            setDashboardStats({
                totalApplications: 0,
                availableJobs: 0,
                upcomingEvents: 0,
                profileViews: 0,
                statusCounts: {},
                candidateEventRegistrations: 0,
                recentApplications: []
            });
        } finally {
            console.log('✅ Dashboard data loading completed');
            setLoading(false);
        }
    };

    const quickStats = [
        {
            title: 'Applied Jobs',
            value: (dashboardStats.totalApplications || 0).toString(),
            icon: 'fa-briefcase',
            color: 'yellow',
            details: [
                { label: 'Total Applications', value: (dashboardStats.totalApplications || 0).toString() },
                { label: 'This Month', value: Math.floor((dashboardStats.totalApplications || 0) * 0.3).toString() }
            ]
        },
        {
            title: 'Available Jobs',
            value: (dashboardStats.availableJobs || 0).toString(),
            icon: 'fa-search',
            color: 'blue',
            details: [
                { label: 'Open Positions', value: (dashboardStats.availableJobs || 0).toString() },
                { label: 'New This Week', value: Math.floor((dashboardStats.availableJobs || 0) * 0.1).toString() }
            ]
        },
        {
            title: 'Upcoming Events',
            value: (dashboardStats.upcomingEvents || 0).toString(),
            icon: 'fa-calendar-check',
            color: 'pink',
            details: [
                { label: 'Total Events', value: (dashboardStats.upcomingEvents || 0).toString() },
                { label: 'Registered', value: (dashboardStats.candidateEventRegistrations || 0).toString() }
            ]
        },
        {
            title: 'Profile Views',
            value: (dashboardStats.profileViews || 0).toString(),
            icon: 'fa-eye',
            color: 'orange',
            details: [
                { label: 'Total Views', value: (dashboardStats.profileViews || 0).toString() },
                { label: 'This Week', value: Math.floor((dashboardStats.profileViews || 0) * 0.2).toString() }
            ]
        }
    ];

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FF9800';
            case 'accepted': case 'interview': return '#4CAF50';
            case 'rejected': return '#F44336';
            default: return '#FF9800';
        }
    };

    const handleApplyToJob = async (jobId) => {
        try {
            await apiService.applyToJob(jobId, {});
            setNotification('Application submitted successfully!');
            loadDashboardData(); // Refresh data
        } catch (error) {
            setNotification('Failed to apply. Please try again.');
        }
    };

    const handleRegisterForEvent = async (eventId) => {
        try {
            await apiService.registerForEvent(eventId);
            setNotification('Successfully registered for event!');
            loadDashboardData();
        } catch (error) {
            setNotification('Failed to register. Please try again.');
        }
    };

    const handleEditProfile = () => {
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
    };

    const handleSaveProfile = async () => {
        try {
            const updatedUser = await apiService.updateProfile(profileData);
            setNotification('Profile updated successfully!');
            setIsEditingProfile(false);
            // Update the auth context with new user data
            // You might need to add an updateUser method to AuthContext
        } catch (error) {
            setNotification('Failed to update profile. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setProfileData({
            fullName: '',
            email: '',
            phone: '',
            city: '',
            state: '',
            country: '',
            bio: ''
        });
    };

    const handleProfileInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (authLoading || loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-background"></div>
                <div className="loading-container">
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    // Debug log to check if component is rendering
    console.log('CandidateDashboard rendering with user:', authUser);
    console.log('User name fields:', {
        fullName: authUser?.fullName,
        name: authUser?.name,
        firstChar: (authUser?.fullName || authUser?.name)?.charAt(0)?.toUpperCase()
    });

    return (
        <div className="dashboard-container">
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
            <div className="paginacontainer">
                <div className="progress-wrap warp2">
                    <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                    </svg>
                </div>
            </div>
            <div className="dashboard-background"></div>

            {/* Dashboard Header */}
            <header className="candidate-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo-section">
                            <img
                                src="assets/img/logo/logo5.png"
                                alt="ROAC Logo"
                                className="dashboard-logo"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <nav className="header-nav">
                        <button
                            className={`nav-btn ${activeTab === 'internships' ? 'active' : ''}`}
                            onClick={() => setActiveTab('internships')}
                        >
                            <i className="fas fa-briefcase"></i>
                            <span>Dashboard</span>
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('jobs')}
                        >
                            <i className="fas fa-search"></i>
                            <span>Find Jobs</span>
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            <i className="fas fa-file-alt"></i>
                            <span>Applications</span>
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
                            onClick={() => setActiveTab('events')}
                        >
                            <i className="fas fa-calendar"></i>
                            <span>Events</span>
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <i className="fas fa-user"></i>
                            <span>Profile</span>
                        </button>
                    </nav>

                    <div className="header-right">
                        <div className="header-actions">
                            <button className="notification-btn">
                                <i className="fas fa-bell"></i>
                                <span className="notification-badge">3</span>
                            </button>
                            <div className="user-menu">
                                <div className="user-avatar">
                                    {(authUser?.fullName || authUser?.name)?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="user-name">{authUser?.fullName || authUser?.name || 'User'}</span>
                            </div>
                            <button
                                className="logout-btn"
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notification */}
            {notification && (
                <div className="notification-banner">
                    <div className="container">
                        <div className="notification-content">
                            <i className="fas fa-info-circle"></i>
                            <span>{notification}</span>
                            <button onClick={() => setNotification('')} className="notification-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Dashboard Content */}
            <div className="dashboard-content">
                <div className="container">

                    {/* Default Dashboard Content */}
                    {(activeTab === 'internships') && (
                        <div className="tab-content">
                            {/* Quick Stats */}
                            <div className="stats-grid mb-4">
                                {quickStats.map((stat, index) => (
                                    <div key={index} className={`stat-card ${stat.color} enhanced-card`}>
                                        <div className="stat-icon-row">
                                            <div className="stat-icon">
                                                <i className={`fas ${stat.icon}`}></i>
                                            </div>
                                            <div className="stat-number">{stat.value}</div>
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-label">{stat.title}</div>
                                            {stat.details.map((detail, idx) => (
                                                <div key={idx} className="stat-details">
                                                    <div>{detail.label}</div>
                                                    <div>{detail.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Find Internships Section */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Find Internships</h4>
                                            <div className="search-stats">
                                                <span>{dashboardStats.availableJobs || 0}+ internships available</span>
                                            </div>
                                        </div>
                                        <div className="internship-search-section">
                                            <div className="search-filters">
                                                <div className="row">
                                                    <div className="col-md-4 mb-3">
                                                        <div className="search-input-wrapper">
                                                            <input type="text" className="form-control" placeholder="Internship title, company..." />
                                                            <i className="fas fa-search search-icon"></i>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <select className="form-control">
                                                            <option>All Fields</option>
                                                            <option>Software Development</option>
                                                            <option>Data Science</option>
                                                            <option>Digital Marketing</option>
                                                            <option>Design</option>
                                                            <option>Content Writing</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <select className="form-control">
                                                            <option>All Locations</option>
                                                            <option>Remote</option>
                                                            <option>Delhi</option>
                                                            <option>Mumbai</option>
                                                            <option>Bangalore</option>
                                                            <option>Pune</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-2 mb-3">
                                                        <button className="btn btn-primary w-100">
                                                            <i className="fas fa-search"></i> Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Filter Tags */}
                                            <div className="quick-filters">
                                                <span className="filter-label">Popular:</span>
                                                <button className="filter-tag">Paid Internships</button>
                                                <button className="filter-tag">Remote</button>
                                                <button className="filter-tag">Full-time</button>
                                                <button className="filter-tag">Tech</button>
                                                <button className="filter-tag">Marketing</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {/* Recent Applications */}
                                <div className="col-lg-8 mb-4">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Recent Applications</h4>
                                            <a href="#" className="view-all">View All</a>
                                        </div>
                                        <div className="applications-list">
                                            {applications.length > 0 ? applications.slice(0, 3).map(app => (
                                                <div key={app.id} className="application-item">
                                                    <div className="application-info">
                                                        <h5>{app.Job?.title || 'Job Title'}</h5>
                                                        <p>{app.Job?.company || 'Company Name'}</p>
                                                        <span className="applied-date">Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="application-status">
                                                        <span
                                                            className="status-badge"
                                                            style={{ backgroundColor: getStatusColor(app.status) }}
                                                        >
                                                            {app.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="no-data">
                                                    <p>No applications yet. Start applying to jobs!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Events */}
                                <div className="col-lg-4 mb-4">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Upcoming Events</h4>
                                        </div>
                                        <div className="events-list">
                                            {events.length > 0 ? events.slice(0, 3).map(event => (
                                                <div key={event.id} className="event-item">
                                                    <div className="event-date">
                                                        <span className="date">{new Date(event.date).getDate()}</span>
                                                        <span className="month">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                                                    </div>
                                                    <div className="event-info">
                                                        <h6>{event.title}</h6>
                                                        <p>{event.description}</p>
                                                        <span className="event-type">{event.type || 'Event'}</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="no-data">
                                                    <p>No upcoming events</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommended Jobs */}
                            <div className="row">
                                <div className="col-12">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Recommended Jobs</h4>
                                            <a href="#" className="view-all">View All</a>
                                        </div>
                                        <div className="row">
                                            {jobs.length > 0 ? jobs.slice(0, 4).map(job => (
                                                <div key={job.id} className="col-md-6 mb-3">
                                                    <div className="job-recommendation">
                                                        <div className="job-header">
                                                            <h5>{job.title}</h5>
                                                            <span className="match-percentage">New</span>
                                                        </div>
                                                        <p className="company">{job.company}</p>
                                                        <div className="job-details">
                                                            <span><i className="fas fa-map-marker-alt"></i> {job.location || 'Remote'}</span>
                                                            <span><i className="fas fa-rupee-sign"></i> {job.salary || 'Competitive'}</span>
                                                        </div>
                                                        <div className="job-actions">
                                                            <button
                                                                className="btn-apply"
                                                                onClick={() => handleApplyToJob(job.id)}
                                                            >
                                                                Apply Now
                                                            </button>
                                                            <button className="btn-save"><i className="fas fa-bookmark"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-12">
                                                    <div className="no-data">
                                                        <p>No jobs available at the moment</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Jobs Tab */}
                    {(activeTab === 'jobs') && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>Find Jobs</h4>
                                    <div className="search-stats">
                                        <span>{dashboardStats.availableJobs || 0} jobs available</span>
                                    </div>
                                </div>
                                <div className="job-search-section">
                                    <div className="search-filters">
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <div className="search-input-wrapper">
                                                    <input type="text" className="form-control" placeholder="Job title, keywords..." />
                                                    <i className="fas fa-search search-icon"></i>
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <select className="form-control">
                                                    <option>All Categories</option>
                                                    <option>Software Development</option>
                                                    <option>Data Science</option>
                                                    <option>Design</option>
                                                    <option>Marketing</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <select className="form-control">
                                                    <option>All Locations</option>
                                                    <option>Remote</option>
                                                    <option>Delhi</option>
                                                    <option>Mumbai</option>
                                                    <option>Bangalore</option>
                                                </select>
                                            </div>
                                            <div className="col-md-2 mb-3">
                                                <button className="btn btn-primary w-100">
                                                    <i className="fas fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Job Listings */}
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>Available Jobs</h4>
                                    <span className="job-count">{jobs.length || 0} jobs found</span>
                                </div>
                                <div className="jobs-grid">
                                    {jobs.map(job => (
                                        <div key={job.id} className="job-card-detailed">
                                            <div className="job-card-header">
                                                <div className="company-logo">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div className="job-basic-info">
                                                    <h5>{job.title}</h5>
                                                    <p className="company-name">{job.company}</p>
                                                </div>
                                                <button className="save-job-btn">
                                                    <i className="far fa-bookmark"></i>
                                                </button>
                                            </div>

                                            <div className="job-details-grid">
                                                <div className="detail-item">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    <span>{job.location || 'Remote'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-rupee-sign"></i>
                                                    <span>{job.salary || 'Competitive'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-briefcase"></i>
                                                    <span>{job.experience || 'All levels'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-calendar"></i>
                                                    <span>{job.type || 'Full-time'}</span>
                                                </div>
                                            </div>

                                            <div className="job-skills">
                                                {job.requirements && job.requirements.split(',').slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="skill-tag">{skill.trim()}</span>
                                                ))}
                                            </div>

                                            <div className="job-card-footer">
                                                <span className="posted-time">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                <div className="job-actions">
                                                    <button className="btn-secondary">View Details</button>
                                                    <button
                                                        className="btn-apply"
                                                        onClick={() => handleApplyToJob(job.id)}
                                                    >
                                                        Apply Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coming Soon Tabs */}
                    {(activeTab === 'competitions' || activeTab === 'scholarships' || activeTab === 'workshops' || activeTab === 'prime-hub') && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="coming-soon-section">
                                    <div className="coming-soon-icon">
                                        <i className="fas fa-rocket"></i>
                                    </div>
                                    <h3>Coming Soon!</h3>
                                    <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development. Stay tuned for amazing opportunities!</p>
                                    <button className="btn-primary" onClick={() => setActiveTab('jobs')}>
                                        Explore Jobs Meanwhile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>My Applications</h4>
                                    <div className="filter-tabs">
                                        <button className="filter-tab active">All</button>
                                        <button className="filter-tab">Applied</button>
                                        <button className="filter-tab">Interview</button>
                                        <button className="filter-tab">Rejected</button>
                                    </div>
                                </div>
                                <div className="applications-detailed">
                                    {applications.length > 0 ? applications.map(app => (
                                        <div key={app.id} className="application-detailed-item">
                                            <div className="application-content">
                                                <div className="application-main">
                                                    <h5>{app.Job?.title || 'Job Title'}</h5>
                                                    <p className="company-name">{app.Job?.company || 'Company Name'}</p>
                                                    <div className="application-meta">
                                                        <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="application-status">
                                                    <div className="status-section">
                                                        <span><i className="fas fa-calendar"></i> Applied: {app.appliedDate}</span>
                                                        <span
                                                            className="status-badge"
                                                            style={{ backgroundColor: getStatusColor(app.status) }}
                                                        >
                                                            {app.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="application-actions">
                                                    <button className="btn-secondary">View Details</button>
                                                    <button className="btn-primary">Follow Up</button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="no-data">
                                            <p>No applications found. Start applying to jobs!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="tab-content">
                            <div className="row">
                                <div className="col-lg-8 mb-4">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Upcoming Events</h4>
                                        </div>
                                        <div className="events-detailed">
                                            {events.length > 0 ? events.map(event => (
                                                <div key={event.id} className="event-detailed-item">
                                                    <div className="event-image">
                                                        <div className="event-placeholder">
                                                            <i className="fas fa-calendar-alt"></i>
                                                        </div>
                                                    </div>
                                                    <div className="event-content">
                                                        <h5>{event.title}</h5>
                                                        <p>{event.description || 'Join us for an exciting event to enhance your skills'}</p>
                                                        <div className="event-meta">
                                                            <span><i className="fas fa-calendar"></i> {new Date(event.date).toLocaleDateString()}</span>
                                                            <span><i className="fas fa-map-marker-alt"></i> {event.location || 'Online'}</span>
                                                            <span className="event-type-badge">{event.type || 'Event'}</span>
                                                        </div>
                                                        <button
                                                            className="btn-primary mt-2"
                                                            onClick={() => handleRegisterForEvent(event.id)}
                                                        >
                                                            Register Now
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="no-data">
                                                    <p>No events available at the moment</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Event Categories</h4>
                                        </div>
                                        <div className="event-categories">
                                            <div className="category-item">
                                                <i className="fas fa-laptop-code"></i>
                                                <span>Workshops</span>
                                            </div>
                                            <div className="category-item">
                                                <i className="fas fa-users"></i>
                                                <span>Networking</span>
                                            </div>
                                            <div className="category-item">
                                                <i className="fas fa-trophy"></i>
                                                <span>Competitions</span>
                                            </div>
                                            <div className="category-item">
                                                <i className="fas fa-microphone"></i>
                                                <span>Conferences</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <div className="row">
                                <div className="col-lg-4 mb-4">
                                    <div className="dashboard-card">
                                        <div className="profile-summary">
                                            <div className="profile-image-section">
                                                <img src={authUser?.profileImage || '/assets/img/profile-placeholder.jpg'} alt="Profile" onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjRkZENjAwIi8+Cjxzdmcgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0iIzFBMTcxOSIvPgo8cGF0aCBkPSJNMTIgMTRDOS4zMyAxMy45OSA3LjAxIDE1LjYyIDYgMThWMjBIMThWMThDMTYuOTkgMTUuNjIgMTQuNjcgMTMuOTkgMTIgMTRaIiBmaWxsPSIjMUExNzE5Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                                                }} />
                                                <button className="change-photo-btn">
                                                    <i className="fas fa-camera"></i>
                                                </button>
                                            </div>
                                            <h4>{authUser?.fullName || authUser?.name || 'User'}</h4>
                                            <p>{authUser?.email || 'user@example.com'}</p>
                                            <div className="profile-completion-mini">
                                                <span>Profile: 75% Complete</span>
                                                <div className="mini-progress">
                                                    <div
                                                        className="mini-progress-fill"
                                                        style={{ width: '75%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-8">
                                    <div className="dashboard-card">
                                        <div className="card-header">
                                            <h4>Profile Information</h4>
                                            {!isEditingProfile ? (
                                                <button className="btn-edit" onClick={handleEditProfile}>Edit Profile</button>
                                            ) : (
                                                <div className="edit-actions">
                                                    <button className="btn-save" onClick={handleSaveProfile}>Save</button>
                                                    <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="profile-form">
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.fullName : (authUser?.fullName || authUser?.name || '')}
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.email : (authUser?.email || '')}
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>Phone</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.phone : (authUser?.phone || '')}
                                                        placeholder="Add phone number"
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.city : (authUser?.city || '')}
                                                        placeholder="Add city"
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('city', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>State</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.state : (authUser?.state || '')}
                                                        placeholder="Add state"
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('state', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>Country</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={isEditingProfile ? profileData.country : (authUser?.country || '')}
                                                        placeholder="Add country"
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('country', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <label>Professional Summary</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="4"
                                                        value={isEditingProfile ? profileData.bio : (authUser?.bio || '')}
                                                        placeholder="Tell us about yourself..."
                                                        readOnly={!isEditingProfile}
                                                        onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>Experience Level</label>
                                                    <select className="form-control">
                                                        <option>Select experience</option>
                                                        <option>Entry Level (0-2 years)</option>
                                                        <option>Mid Level (2-5 years)</option>
                                                        <option>Senior Level (5+ years)</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label>Preferred Job Type</label>
                                                    <select className="form-control">
                                                        <option>Select job type</option>
                                                        <option>Full-time</option>
                                                        <option>Part-time</option>
                                                        <option>Contract</option>
                                                        <option>Freelance</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;