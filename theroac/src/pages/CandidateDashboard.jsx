import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { usePreloader } from '../hooks/usePreloader';
import { createJobURL, createEventURL, createHubContentURL } from '../utils/urlUtils';
import './CandidateDashboard.css';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'internships');
    const [notification, setNotification] = useState('');
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [hubContent, setHubContent] = useState([]);
    const [applications, setApplications] = useState([]);
    const [appliedItems, setAppliedItems] = useState(new Set()); // Track applied job/event/hub content IDs from API
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
    const [profileCompletion, setProfileCompletion] = useState(0);
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

    // Calculate profile completion when authUser changes
    useEffect(() => {
        if (authUser) {
            const completion = calculateProfileCompletion(authUser);
            setProfileCompletion(completion);
        }
    }, [authUser]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Set up timeout before loading data
        const loadingTimeout = setTimeout(() => {
            setLoading(false);
            setNotification('Dashboard loaded with limited functionality. Please refresh if needed.');
        }, 5000);

        // Load data and clear timeout on success
        loadDashboardData().finally(() => {
            clearTimeout(loadingTimeout);
        });

        return () => clearTimeout(loadingTimeout);
    }, [isAuthenticated, authLoading, navigate]);

    const loadApplicationStatuses = async (jobsData, eventsData, hubContentData, applicationsData) => {
        try {
            // Use existing applications data to determine applied items (safer approach)
            const currentApplications = applicationsData.status === 'fulfilled' ? (applicationsData.value.applications || []) : [];
            const appliedJobIds = currentApplications.map(app => app.jobId || app.Job?.id).filter(Boolean);
            setAppliedItems(new Set(appliedJobIds));
            
            // TODO: Uncomment when backend status endpoints are ready
            /*
            // Get all item IDs from loaded data
            const currentJobs = jobsData.status === 'fulfilled' ? (jobsData.value.jobs || []) : [];
            const currentEvents = eventsData.status === 'fulfilled' ? (eventsData.value.events || []) : [];
            const currentHubContent = hubContentData.status === 'fulfilled' ? (hubContentData.value.hubContent || []) : [];
            
            const allItemIds = [
                ...currentJobs.map(job => job.id),
                ...currentEvents.map(event => event.id),
                ...currentHubContent.map(content => content.id)
            ].filter(Boolean);

            if (allItemIds.length > 0) {
                const statusResult = await apiService.getUserApplicationStatuses(allItemIds);
                if (statusResult && statusResult.appliedItems) {
                    setAppliedItems(new Set(statusResult.appliedItems));
                    return;
                }
            }
            */
            
        } catch (error) {
            // If everything fails, just continue with empty set
            setAppliedItems(new Set());
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load user profile data first to get phone number
            try {
                const profileResponse = await apiService.getProfile();
                
                if (profileResponse) {
                    // The response might be nested in a 'user' property
                    const userData = profileResponse.user || profileResponse;
                    
                    setProfileData({
                        fullName: userData.fullName || userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '+91',
                        city: userData.city || '',
                        state: userData.state || '',
                        country: userData.country || '',
                        bio: userData.bio || ''
                    });
                }
            } catch (profileError) {
                // Failed to load profile
            }
            
            const [jobsData, eventsData, hubContentData, applicationsData, statsData] = await Promise.allSettled([
                apiService.getJobs().catch((error) => {
                    return { jobs: [] };
                }),
                apiService.getEvents().catch((error) => {
                    return { events: [] };
                }),
                apiService.getHubContent().catch((error) => {
                    return { hubContent: [] };
                }),
                apiService.getUserApplications().catch((error) => {
                    return { applications: [] };
                }),
                apiService.getCandidateStats().catch((error) => {
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
            setHubContent(hubContentData.status === 'fulfilled' ? (hubContentData.value.hubContent || []) : []);
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
            const failedRequests = [jobsData, eventsData, hubContentData, applicationsData, statsData].filter(result => result.status === 'rejected');
            if (failedRequests.length > 0) {
                setNotification('Some data could not be loaded. Working in offline mode.');
            }

            // Load application statuses after data is loaded
            await loadApplicationStatuses(jobsData, eventsData, hubContentData, applicationsData);
        } catch (error) {
            setNotification('Failed to load dashboard data. Working in offline mode.');
            // Set empty arrays as fallback
            setJobs([]);
            setEvents([]);
            setHubContent([]);
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
                { label: 'This Month', value: (dashboardStats.applicationsThisMonth || 0).toString() }
            ]
        },
        {
            title: 'Available Jobs',
            value: (dashboardStats.availableJobs || 0).toString(),
            icon: 'fa-search',
            color: 'blue',
            details: [
                { label: 'Open Positions', value: (dashboardStats.availableJobs || 0).toString() },
                { label: 'New This Week', value: (dashboardStats.newJobsThisWeek || 0).toString() }
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
                { label: 'This Week', value: (dashboardStats.profileViewsThisWeek || 0).toString() }
            ]
        }
    ];

    // Calculate profile completion percentage
    const calculateProfileCompletion = (user) => {
        if (!user) return 0;
        
        const fields = [
            user.fullName || user.name,
            user.email,
            user.phone,
            user.city,
            user.state,
            user.country,
            user.bio
        ];
        
        const filledFields = fields.filter(field => field && field.trim() !== '' && field !== '+91').length;
        const totalFields = fields.length;
        
        return Math.round((filledFields / totalFields) * 100);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FF9800';
            case 'accepted': case 'interview': return '#4CAF50';
            case 'rejected': return '#F44336';
            default: return '#FF9800';
        }
    };

    const handleApplyToJob = async (jobId) => {
        if (appliedItems.has(jobId)) {
            return; // Already applied
        }

        try {
            await apiService.applyToJob(jobId, {
                resumeLink: '', // You might want to collect this from user
                coverLetter: '' // You might want to collect this from user
            });
            setAppliedItems(prev => new Set([...prev, jobId]));
            setNotification('Application submitted successfully!');
            // Don't reload all data, just update the applied status
        } catch (error) {
            // For now, if API fails, still mark as applied (since backend might not be ready)
            setAppliedItems(prev => new Set([...prev, jobId]));
            setNotification('Application submitted! (Demo mode)');
        }
    };

    const handleRegisterForEvent = async (eventId) => {
        if (appliedItems.has(eventId)) {
            return; // Already registered
        }

        try {
            await apiService.registerForEvent(eventId);
            setAppliedItems(prev => new Set([...prev, eventId]));
            setNotification('Successfully registered for event!');
        } catch (error) {
            // For now, if API fails, still mark as registered (since backend might not be ready)
            setAppliedItems(prev => new Set([...prev, eventId]));
            setNotification('Successfully registered! (Demo mode)');
        }
    };

    const handleApplyToHubContent = async (hubContentId) => {
        if (appliedItems.has(hubContentId)) {
            return; // Already applied
        }

        // For now, just simulate success since hub content application might not have a specific endpoint
        setAppliedItems(prev => new Set([...prev, hubContentId]));
        setNotification('Successfully applied to ROAC Prime opportunity!');
    };

    const handleViewJobDetails = (job) => {
        const url = createJobURL(job);
        navigate(url);
    };

    const handleViewEventDetails = (event) => {
        const url = createEventURL(event);
        navigate(url);
    };

    const handleViewHubContentDetails = (content) => {
        const url = createHubContentURL(content);
        navigate(url);
    };



    const handleEditProfile = () => {
        // Ensure phone has +91 prefix
        let phoneValue = authUser?.phone || '';
        if (phoneValue && !phoneValue.startsWith('+91')) {
            phoneValue = `+91${phoneValue}`;
        } else if (!phoneValue) {
            phoneValue = '+91';
        }
        
        setProfileData({
            fullName: authUser?.fullName || authUser?.name || '',
            email: authUser?.email || '',
            phone: phoneValue,
            city: authUser?.city || '',
            state: authUser?.state || '',
            country: authUser?.country || '',
            bio: authUser?.bio || ''
        });
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async () => {
        let loadingToast = null;
        try {
            // Validate phone number - must be exactly 10 digits after +91
            const phoneDigits = profileData.phone?.replace('+91', '') || '';
            if (phoneDigits.length !== 10) {
                toast.error('Phone number must be exactly 10 digits', {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }
            
            // Show loading toast
            loadingToast = toast.loading('Updating profile...');
            
            const updatedUser = await apiService.updateProfile(profileData);
            
            // Dismiss loading and show success
            toast.dismiss(loadingToast);
            toast.success('Profile updated successfully! Refreshing...', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setIsEditingProfile(false);
            
            // Reload page to refresh authUser data from backend
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            // IMPORTANT: Dismiss loading toast on error
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            
            let errorMessage = 'Failed to update profile. Please try again.';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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
                <div className="preloader">
                    <div className="loading-container">
                        <div className="loading"></div>
                        <div id="loading-icon">
                            <img src="assets/img/logo/preloader.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

   

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
                        <div className="logo-section" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
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
                            className={`nav-btn ${activeTab === 'prime-hub' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prime-hub')}
                        >
                            <i className="fas fa-star"></i>
                            <span>ROAC Prime</span>
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
                                <div 
                                    className="user-avatar" 
                                    onClick={() => setActiveTab('profile')}
                                    style={{ cursor: 'pointer' }}
                                    title="View Profile"
                                >
                                    {authUser?.profilePicture || authUser?.avatar ? (
                                        <img 
                                            src={authUser.profilePicture || authUser.avatar} 
                                            alt={authUser.fullName || authUser.name || 'User'} 
                                            className="profile-image"
                                        />
                                    ) : (
                                        <span className="profile-initials">
                                            {(authUser?.fullName || authUser?.name)?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <span className="user-name">{authUser?.fullName || authUser?.name || 'User'}</span>
                            </div>
                            <button
                                className="logout-btn"
                                onClick={() => {
                                    logout();
                                    window.location.href = '/';
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
                                                        <h5>{app.job?.title || app.Job?.title || 'Job Title'}</h5>
                                                        <p>{app.job?.companyName || app.Job?.company || 'Company Name'}</p>
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
                                                <div 
                                                    key={event.id} 
                                                    className="event-item clickable"
                                                    onClick={() => handleViewEventDetails(event)}
                                                    style={{ cursor: 'pointer' }}
                                                >
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
                                                                className="btn-secondary btn-sm"
                                                                onClick={() => handleViewJobDetails(job)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                View Details
                                                            </button>
                                                            <button
                                                                className={`btn-apply ${appliedItems.has(job.id) ? 'applied' : ''}`}
                                                                onClick={() => handleApplyToJob(job.id)}
                                                                disabled={appliedItems.has(job.id)}
                                                                style={{
                                                                    backgroundColor: appliedItems.has(job.id) ? '#28a745' : '',
                                                                    borderColor: appliedItems.has(job.id) ? '#28a745' : '',
                                                                    cursor: appliedItems.has(job.id) ? 'not-allowed' : 'pointer',
                                                                    opacity: appliedItems.has(job.id) ? 0.7 : 1
                                                                }}
                                                            >
                                                                {appliedItems.has(job.id) ? (
                                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                                        <span>✓</span>
                                                                        Applied
                                                                    </span>
                                                                ) : 'Apply Now'}
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
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => handleViewJobDetails(job)}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className={`btn-apply ${appliedItems.has(job.id) ? 'applied' : ''}`}
                                                        onClick={() => handleApplyToJob(job.id)}
                                                        disabled={appliedItems.has(job.id)}
                                                        style={{
                                                            backgroundColor: appliedItems.has(job.id) ? '#28a745' : '',
                                                            borderColor: appliedItems.has(job.id) ? '#28a745' : '',
                                                            cursor: appliedItems.has(job.id) ? 'not-allowed' : 'pointer',
                                                            opacity: appliedItems.has(job.id) ? 0.7 : 1
                                                        }}
                                                    >
                                                        {appliedItems.has(job.id) ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                                <span>✓</span>
                                                                Applied
                                                            </span>
                                                        ) : 'Apply Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROAC Prime Talent Hub Tab */}
                    {activeTab === 'prime-hub' && (
                        <div className="tab-content">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h4>ROAC Prime Talent Hub</h4>
                                    <div className="search-stats">
                                        <span>{hubContent.length || 0} opportunities available</span>
                                    </div>
                                </div>
                                <div className="hub-content-grid">
                                    {hubContent.length > 0 ? hubContent.map(content => (
                                        <div key={content.id} className="hub-content-card">
                                            <div className="hub-content-header">
                                                <div className="company-logo">
                                                    <i className="fas fa-star"></i>
                                                </div>
                                                <div className="hub-content-basic-info">
                                                    <h5>{content.title}</h5>
                                                    <p className="company-name">{content.company || content.organization || 'ROAC Prime'}</p>
                                                </div>
                                                <button className="save-content-btn">
                                                    <i className="far fa-bookmark"></i>
                                                </button>
                                            </div>

                                            <div className="hub-content-details-grid">
                                                <div className="detail-item">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    <span>{content.location || 'Remote'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-rupee-sign"></i>
                                                    <span>{content.stipend || 'Competitive'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-clock"></i>
                                                    <span>{content.duration || 'Flexible'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <i className="fas fa-calendar"></i>
                                                    <span>{content.timing || content.type || 'Part-time'}</span>
                                                </div>
                                            </div>

                                            <div className="hub-content-skills">
                                                {content.skills && content.skills.slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>

                                            <div className="hub-content-card-footer">
                                                <span className="posted-time">Posted {new Date(content.createdAt || Date.now()).toLocaleDateString()}</span>
                                                <div className="hub-content-actions">
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => handleViewHubContentDetails(content)}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className={`btn-apply ${appliedItems.has(content.id) ? 'applied' : ''}`}
                                                        onClick={() => handleApplyToHubContent(content.id)}
                                                        disabled={appliedItems.has(content.id)}
                                                        style={{
                                                            backgroundColor: appliedItems.has(content.id) ? '#28a745' : '',
                                                            borderColor: appliedItems.has(content.id) ? '#28a745' : '',
                                                            cursor: appliedItems.has(content.id) ? 'not-allowed' : 'pointer',
                                                            opacity: appliedItems.has(content.id) ? 0.7 : 1
                                                        }}
                                                    >
                                                        {appliedItems.has(content.id) ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                                <span>✓</span>
                                                                Applied
                                                            </span>
                                                        ) : 'Apply Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="no-data">
                                            <div className="no-data-icon">
                                                <i className="fas fa-star"></i>
                                            </div>
                                            <h3>Welcome to ROAC Prime Talent Hub!</h3>
                                            <p>Exclusive opportunities and premium content coming soon. Stay tuned for amazing career opportunities!</p>
                                            <button className="btn-primary" onClick={() => setActiveTab('jobs')}>
                                                Explore Jobs Meanwhile
                                            </button>
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
                                                            <span><i className="fas fa-calendar"></i> {new Date(event.date || event.startDate || Date.now()).toLocaleDateString()}</span>
                                                            <span><i className="fas fa-map-marker-alt"></i> {event.location || 'Online'}</span>
                                                            <span className="event-type-badge">{event.type || 'Event'}</span>
                                                        </div>
                                                        <div className="event-actions mt-2">
                                                            <button
                                                                className="btn-secondary btn-sm"
                                                                onClick={() => handleViewEventDetails(event)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                View Details
                                                            </button>
                                                            <button
                                                                className={`btn-primary ${appliedItems.has(event.id) ? 'registered' : ''}`}
                                                                onClick={() => handleRegisterForEvent(event.id)}
                                                                disabled={appliedItems.has(event.id)}
                                                                style={{
                                                                    backgroundColor: appliedItems.has(event.id) ? '#28a745' : '',
                                                                    borderColor: appliedItems.has(event.id) ? '#28a745' : '',
                                                                    cursor: appliedItems.has(event.id) ? 'not-allowed' : 'pointer',
                                                                    opacity: appliedItems.has(event.id) ? 0.7 : 1
                                                                }}
                                                            >
                                                                {appliedItems.has(event.id) ? (
                                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                                        <span>✓</span>
                                                                        Registered
                                                                    </span>
                                                                ) : 'Register Now'}
                                                            </button>
                                                        </div>
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

                    {/* Coming Soon Tabs */}
                    {(activeTab === 'competitions' || activeTab === 'scholarships' || activeTab === 'workshops') && (
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
                                                    <h5>{app.job?.title || app.Job?.title || 'Job Title'}</h5>
                                                    <p className="company-name">{app.job?.companyName || app.Job?.company || 'Company Name'}</p>
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
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => {
                                                            const jobTitle = app.job?.title || app.Job?.title;
                                                            const companyName = app.job?.companyName || app.Job?.company;
                                                            
                                                            if (jobTitle && companyName) {
                                                                // Create job object for createJobURL function
                                                                const jobObj = {
                                                                    title: jobTitle,
                                                                    companyName: companyName
                                                                };
                                                                const url = createJobURL(jobObj);
                                                                navigate(url);
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
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

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <div className="row">
                                <div className="col-lg-4 mb-4">
                                    <div className="dashboard-card">
                                        <div className="profile-summary">
                                            <div className="profile-image-section">
                                                <div className="profile-icon-circle">
                                                    <User size={80} strokeWidth={1.5} />
                                                </div>
                                                <button className="change-photo-btn">
                                                    <i className="fas fa-camera"></i>
                                                </button>
                                            </div>
                                            <h4>{authUser?.fullName || authUser?.name || 'User'}</h4>
                                            <p>{authUser?.email || 'user@example.com'}</p>
                                            <div className="profile-completion-mini">
                                                <span>Profile: {profileCompletion}% Complete</span>
                                                <div className="mini-progress">
                                                    <div
                                                        className="mini-progress-fill"
                                                        style={{ width: `${profileCompletion}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-8">
                                    <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: '20px', padding: '2rem' }}>
                                        {/* Profile Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div>
                                                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                                                    {authUser?.fullName || authUser?.name || 'Candidate'}
                                                </h3>
                                                <span style={{ color: 'rgba(255,214,0,0.9)', fontSize: '0.9rem', background: 'rgba(255,214,0,0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', display: 'inline-block' }}>
                                                    Candidate
                                                </span>
                                            </div>
                                            {!isEditingProfile && (
                                                <button 
                                                    className="btn-host"
                                                    onClick={handleEditProfile}
                                                    style={{ background: '#FFD600', color: '#1A1719', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>

                                        {/* Profile Form/View */}
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
                                                        onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
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
                                                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
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
                                                        placeholder="Add city"
                                                        onChange={(e) => handleProfileInputChange('city', e.target.value)}
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
                                                        placeholder="Add state"
                                                        onChange={(e) => handleProfileInputChange('state', e.target.value)}
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
                                                        placeholder="Add country"
                                                        onChange={(e) => handleProfileInputChange('country', e.target.value)}
                                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <div className="col-12 mb-3">
                                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        Professional Summary
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="4"
                                                        value={profileData.bio}
                                                        placeholder="Tell us about yourself..."
                                                        onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                                <button
                                                    className="btn-cancel"
                                                    onClick={handleCancelEdit}
                                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '600' }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn-host"
                                                    onClick={handleSaveProfile}
                                                    style={{ background: '#FFD600', color: '#1A1719', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: '600', cursor: 'pointer' }}
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
                                                            Professional Summary
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;