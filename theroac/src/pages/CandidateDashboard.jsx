// src/pages/CandidateDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";
import { usePreloader } from "../hooks/usePreloader";
import {
  createJobURL,
  createEventURL,
  createHubContentURL,
} from "../utils/urlUtils";

import DashboardHeader from "../components/candidate-dashboard/DashboardHeader";
import NotificationBanner from "../components/candidate-dashboard/NotificationBanner";
import DashboardTabs from "../components/candidate-dashboard/DashboardTabs";
import HomeTab from "../components/candidate-dashboard/HomeTab";
import JobsTab from "../components/candidate-dashboard/JobsTab";
import EventsTab from "../components/candidate-dashboard/EventsTab";
import PrimeHubTab from "../components/candidate-dashboard/PrimeHubTab";
import ApplicationsTab from "../components/candidate-dashboard/ApplicationsTab";
import ProfileTab from "../components/candidate-dashboard/CandidateProfilePage";

import "./CandidateDashboard.css";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user: authUser,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "internships"
  );
  const [notification, setNotification] = useState("");
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
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // 🔹 profileData me ab resumePath + resumeFile bhi rakhenge
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    bio: "",
    resumePath: "", // backend se stored resume ka path/url
    resumeFile: null, // frontend pe abhi select ki hui file (File object)
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
      navigate("/login");
      return;
    }

    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setNotification(
        "Dashboard loaded with limited functionality. Please refresh if needed."
      );
    }, 5000);

    loadDashboardData().finally(() => {
      clearTimeout(loadingTimeout);
    });

    return () => clearTimeout(loadingTimeout);
  }, [isAuthenticated, authLoading, navigate]);

  const calculateProfileCompletion = (user) => {
    if (!user) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    // Basic info (50 points total)
    if (user.fullName || user.name) earnedPoints += 10;
    if (user.email) earnedPoints += 5;
    if (user.phone) earnedPoints += 10; // Phone is now mandatory
    if (user.headline) earnedPoints += 10;
    if (user.location) earnedPoints += 5;
    if (user.about) earnedPoints += 10;
    totalPoints += 50;

    // Resume (20 points)
    if (user.resumePath || user.resumeUrl) earnedPoints += 20;
    totalPoints += 20;

    // Skills (10 points)
    if (user.skills && user.skills.length > 0) earnedPoints += 10;
    totalPoints += 10;

    // Experience (10 points)
    if (user.experiences && user.experiences.length > 0) earnedPoints += 10;
    totalPoints += 10;

    // Education (10 points)
    if (user.education && user.education.length > 0) earnedPoints += 10;
    totalPoints += 10;

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FF9800";
      case "accepted":
      case "interview":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  const loadApplicationStatuses = async (
    jobsData,
    eventsData,
    hubContentData,
    applicationsData
  ) => {
    try {
      const currentApplications =
        applicationsData.status === "fulfilled"
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

      const [
        jobsData,
        eventsData,
        hubContentData,
        applicationsData,
        statsData,
      ] = await Promise.allSettled([
        apiService.getJobs().catch(() => ({ jobs: [] })),
        apiService.getEvents({ perPage: 50 }).catch(() => ({ events: [] })),
        apiService.getHubContent({ perPage: 100 }).catch(() => ({ hubContent: [] })),
        apiService.getUserApplications().catch(() => ({ applications: [] })),
        apiService.getCandidateStats().catch(() => ({
          totalApplications: 0,
          availableJobs: 0,
          upcomingEvents: 0,
          profileViews: 0,
          statusCounts: {},
          candidateEventRegistrations: 0,
          recentApplications: [],
        })),
      ]);

      // Get jobs from jobs API
      const regularJobs = jobsData.status === "fulfilled" ? jobsData.value.jobs || [] : [];
      
      // Get all hub content - API returns array directly, not wrapped in object
      const allHubContent = hubContentData.status === "fulfilled" ? hubContentData.value || [] : [];
      
      // Separate internships from other hub content
      const internships = allHubContent.filter(item => item.contentType === 'internship');
      const nonInternshipHubContent = allHubContent.filter(item => item.contentType !== 'internship');
      
      // Merge jobs with internships for the Jobs section
      setJobs([...regularJobs, ...internships]);
      
      // The events API returns the array directly, not wrapped in an object
      const eventsArray = eventsData.status === "fulfilled" ? eventsData.value || [] : [];
      setEvents(eventsArray);
      
      // Only set non-internship content for Hub section
      setHubContent(nonInternshipHubContent);
      
      setApplications(
        applicationsData.status === "fulfilled"
          ? applicationsData.value.applications || []
          : []
      );
      setDashboardStats(
        statsData.status === "fulfilled"
          ? statsData.value
          : {
              totalApplications: 0,
              availableJobs: 0,
              upcomingEvents: 0,
              profileViews: 0,
              statusCounts: {},
              candidateEventRegistrations: 0,
              recentApplications: [],
            }
      );

      const failedRequests = [
        jobsData,
        eventsData,
        hubContentData,
        applicationsData,
        statsData,
      ].filter((result) => result.status === "rejected");
      if (failedRequests.length > 0) {
        setNotification(
          "Some data could not be loaded. Working in offline mode."
        );
      }

      await loadApplicationStatuses(
        jobsData,
        eventsData,
        hubContentData,
        applicationsData
      );
    } catch (error) {
      setNotification(
        "Failed to load dashboard data. Working in offline mode."
      );
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
        recentApplications: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Handlers: apply / register / view details ----

  const handleApplyToJob = async (jobId) => {
    if (appliedItems.has(jobId)) return;

    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check user role
    if (authUser?.role === 'recruiter' || authUser?.role === 'admin') {
      setNotification('Recruiters and admins cannot apply. Only candidates can apply.');
      return;
    }

    try {
      // Find the job data
      const job = [...jobs, ...hubContent].find(j => j.id === jobId);
      if (!job) {
        setNotification("Job not found");
        return;
      }

      let result = null;
      
      // Determine if it's an internship or regular job
      if (job.contentType === 'internship') {
        result = await apiService.applyToHubContent(jobId);
      } else {
        result = await apiService.applyToJob(jobId, {
          resumeLink: '',
          coverLetter: ''
        });
      }

      if (result) {
        setAppliedItems((prev) => new Set([...prev, jobId]));
        setNotification(`Successfully applied for ${job.title}!`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Please try again later.';
      console.error('Application error:', error);
      
      if (errorMessage.includes('Already applied')) {
        setNotification('You have already applied to this position.');
        setAppliedItems((prev) => new Set([...prev, jobId]));
      } else {
        setNotification(errorMessage);
      }
    }
  };

  const handleQuickApplySubmit = async (formData) => {
    if (!selectedJob) return;

    try {
      // First, update user profile with new data
      const profileUpdates = {
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        location: formData.location,
        education: [{
          institute: formData.instituteName,
          domain: formData.domain,
          degree: formData.course,
          specialization: formData.courseSpecialization,
          graduationYear: formData.graduationYear,
          duration: formData.courseDuration,
        }],
      };

      // Update profile
      await apiService.updateProfile(profileUpdates);

      // Handle resume upload if provided
      let resumeLink = "";
      if (formData.resumeFile) {
        const resumeFormData = new FormData();
        resumeFormData.append('resume', formData.resumeFile);
        const uploadResult = await apiService.uploadResume(resumeFormData);
        resumeLink = uploadResult.resumePath || uploadResult.url;
      }

      // Submit application
      const isInternship = selectedJob.contentType === 'internship';
      
      if (isInternship) {
        await apiService.applyToHubContent(selectedJob.id);
      } else {
        await apiService.applyToJob(selectedJob.id, {
          resumeLink: resumeLink,
          coverLetter: formData.coverLetter,
          metadata: {
            userType: formData.userType,
            differentlyAbled: formData.differentlyAbled,
          }
        });
      }

      setAppliedItems((prev) => new Set([...prev, selectedJob.id]));
      setShowQuickApply(false);
      setSelectedJob(null);
      setNotification("Application submitted successfully!");
      
      // Reload dashboard data to reflect changes
      loadDashboardData();
    } catch (error) {
      console.error("Application error:", error);
      setNotification(error.message || "Failed to submit application. Please try again.");
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (appliedItems.has(eventId)) return;

    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check user role
    if (authUser?.role === 'recruiter' || authUser?.role === 'admin') {
      setNotification('Recruiters and admins cannot register. Only candidates can register.');
      return;
    }

    try {
      // Find the event data
      const event = events.find(e => e.id === eventId);
      if (!event) {
        setNotification("Event not found");
        return;
      }

      const result = await apiService.registerForEvent(eventId);
      
      if (result) {
        setAppliedItems((prev) => new Set([...prev, eventId]));
        setNotification(`Successfully registered for ${event.title}!`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Please try again later.';
      console.error('Registration error:', error);
      
      if (errorMessage.includes('Already registered')) {
        setNotification('You have already registered for this event.');
        setAppliedItems((prev) => new Set([...prev, eventId]));
      } else {
        setNotification(errorMessage);
      }
    }
  };

  const handleApplyToHubContent = async (hubContentId) => {
    if (appliedItems.has(hubContentId)) return;

    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check user role
    if (authUser?.role === 'recruiter' || authUser?.role === 'admin') {
      setNotification('Recruiters and admins cannot apply. Only candidates can apply.');
      return;
    }

    try {
      // Find the hub content data
      const content = hubContent.find(c => c.id === hubContentId);
      if (!content) {
        setNotification("Content not found");
        return;
      }

      const result = await apiService.applyToHubContent(hubContentId);
      
      if (result) {
        setAppliedItems((prev) => new Set([...prev, hubContentId]));
        setNotification(`Successfully applied for ${content.title}!`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Please try again later.';
      console.error('Hub content application error:', error);
      
      if (errorMessage.includes('Already applied')) {
        setNotification('You have already applied to this content.');
        setAppliedItems((prev) => new Set([...prev, hubContentId]));
      } else {
        setNotification(errorMessage);
      }
    }
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
    let phoneValue = authUser?.phone || "";
    if (phoneValue && !phoneValue.startsWith("+91")) {
      phoneValue = `+91${phoneValue}`;
    } else if (!phoneValue) {
      phoneValue = "+91";
    }

    setProfileData((prev) => ({
      fullName: authUser?.fullName || authUser?.name || prev.fullName || "",
      email: authUser?.email || prev.email || "",
      phone: phoneValue,
      city: authUser?.city || prev.city || "",
      state: authUser?.state || prev.state || "",
      country: authUser?.country || prev.country || "",
      bio: authUser?.bio || prev.bio || "",
      // agar authUser me resumePath aya ho to use karo, warna jo profileData me tha use rakho
      resumePath: authUser?.resumePath || prev.resumePath || "",
      resumeFile: null,
    }));
    setIsEditingProfile(true);
  };

  // 🔹 Profile form me generic input change
  const handleProfileInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔹 Resume file change (ProfileTab se call hoga)
  const handleProfileResumeChange = (file) => {
    if (!file) return;
    // optional: sirf pdf allow
    if (file.type !== "application/pdf") {
      toast.error("Please upload PDF resume only", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      resumeFile: file,
    }));
  };

  const handleSaveProfile = async (profileDataFromComponent) => {
    let loadingToast = null;
    try {
      loadingToast = toast.loading("Updating profile...");

      // Prepare data object
      const dataToSend = {
        fullName: profileDataFromComponent.fullName || "",
        headline: profileDataFromComponent.headline || "",
        email: profileDataFromComponent.email || "",
        phone: profileDataFromComponent.phone || "",
        location: profileDataFromComponent.location || "",
        about: profileDataFromComponent.about || "",
        skills: profileDataFromComponent.skills || [],
        experiences: profileDataFromComponent.experiences || [],
        education: profileDataFromComponent.education || [],
      };


      // If there's a resume file, upload it first
      if (profileDataFromComponent.resumeFile) {
        const resumeFormData = new FormData();
        resumeFormData.append('resume', profileDataFromComponent.resumeFile);
        
        const resumeResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/users/upload-resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: resumeFormData,
        });
        
        const resumeData = await resumeResponse.json();
        
        if (!resumeResponse.ok) {
          throw new Error(resumeData.message || 'Failed to upload resume');
        }
        
        // Add resume path to profile data
        dataToSend.resumePath = resumeData.resumePath || resumeData.url;
      }

      // Now update profile with JSON data
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update authUser with new data from response
      const updatedUserData = data.user || data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
      
      // Reload page after 1 second to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      if (loadingToast) toast.dismiss(loadingToast);

      let errorMessage = "Failed to update profile. Please try again.";
      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "",
      bio: "",
      resumePath: "",
      resumeFile: null,
    });
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
      title: "Applied Jobs",
      value: String(dashboardStats.totalApplications || 0),
      icon: "fa-briefcase",
      color: "yellow",
      details: [
        {
          label: "Total Applications",
          value: String(dashboardStats.totalApplications || 0),
        },
        {
          label: "This Month",
          value: String(dashboardStats.applicationsThisMonth || 0),
        },
      ],
    },
    {
      title: "Available Jobs",
      value: String(dashboardStats.availableJobs || 0),
      icon: "fa-search",
      color: "blue",
      details: [
        {
          label: "Open Positions",
          value: String(dashboardStats.availableJobs || 0),
        },
        {
          label: "New This Week",
          value: String(dashboardStats.newJobsThisWeek || 0),
        },
      ],
    },
    {
      title: "Upcoming Events",
      value: String(dashboardStats.upcomingEvents || 0),
      icon: "fa-calendar-check",
      color: "pink",
      details: [
        {
          label: "Total Events",
          value: String(dashboardStats.upcomingEvents || 0),
        },
        {
          label: "Registered",
          value: String(dashboardStats.candidateEventRegistrations || 0),
        },
      ],
    },
    {
      title: "Profile Views",
      value: String(dashboardStats.profileViews || 0),
      icon: "fa-eye",
      color: "orange",
      details: [
        {
          label: "Total Views",
          value: String(dashboardStats.profileViews || 0),
        },
        {
          label: "This Week",
          value: String(dashboardStats.profileViewsThisWeek || 0),
        },
      ],
    },
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
        <div className="progress-Wrap warp2">
          <svg className="progress-Circle svg-content" viewBox="-1 -1 102 102">
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
        onClose={() => setNotification("")}
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
            // 🔹 new prop: resume file change handler
            onProfileResumeChange={handleProfileResumeChange}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
