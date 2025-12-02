// src/pages/CandidateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { usePreloader } from '../hooks/usePreloader';
import { createJobURL, createEventURL, createHubContentURL } from '../utils/urlUtils';

import DashboardHeader from '../components/candidate-dashboard/DashboardHeader';
import NotificationBanner from '../components/candidate-dashboard/NotificationBanner';
import DashboardTabs from '../components/candidate-dashboard/DashboardTabs';
import HomeTab from '../components/candidate-dashboard/HomeTab';
import JobsTab from '../components/candidate-dashboard/JobsTab';
import EventsTab from '../components/candidate-dashboard/EventsTab';
import PrimeHubTab from '../components/candidate-dashboard/PrimeHubTab';
import ApplicationsTab from '../components/candidate-dashboard/ApplicationsTab';
import ProfileTab from '../components/candidate-dashboard/ProfileTab';

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
  const [appliedItems, setAppliedItems] = useState(new Set());
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

  const preloaderVisible = usePreloader(300);

  // Calculate profile completion
  useEffect(() => {
    if (authUser) {
      const completion = calculateProfileCompletion(authUser);
      setProfileCompletion(completion);
    }
  }, [authUser]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setNotification('Dashboard loaded with limited functionality. Please refresh if needed.');
    }, 5000);

    loadDashboardData().finally(() => {
      clearTimeout(loadingTimeout);
    });

    return () => clearTimeout(loadingTimeout);
  }, [isAuthenticated, authLoading, navigate]);

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

    const filledFields = fields.filter(
      (field) => field && field.trim() !== '' && field !== '+91'
    ).length;
    const totalFields = fields.length;

    return Math.round((filledFields / totalFields) * 100);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'accepted':
      case 'interview':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const loadApplicationStatuses = async (jobsData, eventsData, hubContentData, applicationsData) => {
    try {
      const currentApplications =
        applicationsData.status === 'fulfilled'
          ? applicationsData.value.applications || []
          : [];
      const appliedJobIds = currentApplications
        .map((app) => app.jobId || app.Job?.id)
        .filter(Boolean);

      setAppliedItems(new Set(appliedJobIds));
    } catch (error) {
      setAppliedItems(new Set());
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // profile
      try {
        const profileResponse = await apiService.getProfile();
        if (profileResponse) {
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
      } catch (err) {
        // ignore profile error
      }

      const [jobsData, eventsData, hubContentData, applicationsData, statsData] =
        await Promise.allSettled([
          apiService.getJobs().catch(() => ({ jobs: [] })),
          apiService.getEvents().catch(() => ({ events: [] })),
          apiService.getHubContent().catch(() => ({ hubContent: [] })),
          apiService.getUserApplications().catch(() => ({ applications: [] })),
          apiService.getCandidateStats().catch(() => ({
            totalApplications: 0,
            availableJobs: 0,
            upcomingEvents: 0,
            profileViews: 0,
            statusCounts: {},
            candidateEventRegistrations: 0,
            recentApplications: []
          }))
        ]);

      setJobs(jobsData.status === 'fulfilled' ? jobsData.value.jobs || [] : []);
      setEvents(eventsData.status === 'fulfilled' ? eventsData.value.events || [] : []);
      setHubContent(
        hubContentData.status === 'fulfilled' ? hubContentData.value.hubContent || [] : []
      );
      setApplications(
        applicationsData.status === 'fulfilled'
          ? applicationsData.value.applications || []
          : []
      );
      setDashboardStats(
        statsData.status === 'fulfilled'
          ? statsData.value
          : {
              totalApplications: 0,
              availableJobs: 0,
              upcomingEvents: 0,
              profileViews: 0,
              statusCounts: {},
              candidateEventRegistrations: 0,
              recentApplications: []
            }
      );

      const failedRequests = [jobsData, eventsData, hubContentData, applicationsData, statsData].filter(
        (result) => result.status === 'rejected'
      );
      if (failedRequests.length > 0) {
        setNotification('Some data could not be loaded. Working in offline mode.');
      }

      await loadApplicationStatuses(jobsData, eventsData, hubContentData, applicationsData);
    } catch (error) {
      setNotification('Failed to load dashboard data. Working in offline mode.');
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

  // ---- Handlers: apply / register / view details ----

  const handleApplyToJob = async (jobId) => {
    if (appliedItems.has(jobId)) return;

    try {
      await apiService.applyToJob(jobId, {
        resumeLink: '',
        coverLetter: ''
      });
      setAppliedItems((prev) => new Set([...prev, jobId]));
      setNotification('Application submitted successfully!');
    } catch (error) {
      setAppliedItems((prev) => new Set([...prev, jobId]));
      setNotification('Application submitted! (Demo mode)');
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (appliedItems.has(eventId)) return;

    try {
      await apiService.registerForEvent(eventId);
      setAppliedItems((prev) => new Set([...prev, eventId]));
      setNotification('Successfully registered for event!');
    } catch (error) {
      setAppliedItems((prev) => new Set([...prev, eventId]));
      setNotification('Successfully registered! (Demo mode)');
    }
  };

  const handleApplyToHubContent = (hubContentId) => {
    if (appliedItems.has(hubContentId)) return;

    setAppliedItems((prev) => new Set([...prev, hubContentId]));
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

  // ---- Profile edit handlers ----

  const handleEditProfile = () => {
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
      const phoneDigits = profileData.phone?.replace('+91', '') || '';
      if (phoneDigits.length !== 10) {
        toast.error('Phone number must be exactly 10 digits', {
          position: 'top-center',
          autoClose: 3000
        });
        return;
      }

      loadingToast = toast.loading('Updating profile...');
      await apiService.updateProfile(profileData);

      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully! Refreshing...', {
        position: 'top-center',
        autoClose: 2000
      });

      setIsEditingProfile(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);

      let errorMessage = 'Failed to update profile. Please try again.';
      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError')
      ) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 4000
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
    setProfileData((prev) => ({
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

  const quickStats = [
    {
      title: 'Applied Jobs',
      value: String(dashboardStats.totalApplications || 0),
      icon: 'fa-briefcase',
      color: 'yellow',
      details: [
        { label: 'Total Applications', value: String(dashboardStats.totalApplications || 0) },
        { label: 'This Month', value: String(dashboardStats.applicationsThisMonth || 0) }
      ]
    },
    {
      title: 'Available Jobs',
      value: String(dashboardStats.availableJobs || 0),
      icon: 'fa-search',
      color: 'blue',
      details: [
        { label: 'Open Positions', value: String(dashboardStats.availableJobs || 0) },
        { label: 'New This Week', value: String(dashboardStats.newJobsThisWeek || 0) }
      ]
    },
    {
      title: 'Upcoming Events',
      value: String(dashboardStats.upcomingEvents || 0),
      icon: 'fa-calendar-check',
      color: 'pink',
      details: [
        { label: 'Total Events', value: String(dashboardStats.upcomingEvents || 0) },
        {
          label: 'Registered',
          value: String(dashboardStats.candidateEventRegistrations || 0)
        }
      ]
    },
    {
      title: 'Profile Views',
      value: String(dashboardStats.profileViews || 0),
      icon: 'fa-eye',
      color: 'orange',
      details: [
        { label: 'Total Views', value: String(dashboardStats.profileViews || 0) },
        { label: 'This Week', value: String(dashboardStats.profileViewsThisWeek || 0) }
      ]
    }
  ];

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
          <svg className="progress-circle svg-content" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div>
      <div className="dashboard-background" />

      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        authUser={authUser}
        logout={logout}
      />

      <NotificationBanner
        notification={notification}
        onClose={() => setNotification('')}
      />

      <div className="dashboard-content">
        <div className="container">
          <DashboardTabs
            activeTab={activeTab}
            quickStats={quickStats}
            jobs={jobs}
            events={events}
            hubContent={hubContent}
            applications={applications}
            dashboardStats={dashboardStats}
            appliedItems={appliedItems}
            authUser={authUser}
            profileCompletion={profileCompletion}
            isEditingProfile={isEditingProfile}
            profileData={profileData}
            getStatusColor={getStatusColor}
            onApplyJob={handleApplyToJob}
            onRegisterEvent={handleRegisterForEvent}
            onApplyHubContent={handleApplyToHubContent}
            onViewJobDetails={handleViewJobDetails}
            onViewEventDetails={handleViewEventDetails}
            onViewHubContentDetails={handleViewHubContentDetails}
            onEditProfile={handleEditProfile}
            onSaveProfile={handleSaveProfile}
            onCancelEdit={handleCancelEdit}
            onProfileInputChange={handleProfileInputChange}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
