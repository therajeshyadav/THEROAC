import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreloader } from "../hooks/usePreloader";
import dashboardService from "../services/dashboardService";
import AddContentModal from "../components/AddContentModal";
import {
  Users,
  Briefcase,
  Calendar,
  UserCheck,
  Star,
  ClipboardCheck,
} from "lucide-react";
import "./RecruiterDashboard.css";

import RecruiterHeader from "../components/recruiter-dashboard/RecruiterHeader";
import RecruiterSidebar from "../components/recruiter-dashboard/RecruiterSidebar";
import DashboardTab from "../components/recruiter-dashboard/DashboardTab";
import ManageJobsTab from "../components/recruiter-dashboard/ManageJobsTab";
import ManageEventsTab from "../components/recruiter-dashboard/ManageEventsTab";
import TeamManagementTab from "../components/recruiter-dashboard/TeamManagementTab";
import EvaluateCandidatesTab from "../components/recruiter-dashboard/EvaluateCandidatesTab";
import ComingSoonTab from "../components/recruiter-dashboard/ComingSoonTab";
import SettingsTab from "../components/recruiter-dashboard/SettingsTab";
import TalentPipelineTab from "../components/recruiter-dashboard/TalentPipelineTab";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } =
    useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    // Check sessionStorage first (for page reloads)
    const savedTab = sessionStorage.getItem('activeTab');
    if (savedTab) {
      sessionStorage.removeItem('activeTab'); // Clear after reading
      return savedTab;
    }
    // Otherwise use location state or default
    return location.state?.activeTab || "dashboard";
  });
  const [pendingModalType, setPendingModalType] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [notifications] = useState(3);

  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStage, setSelectedStage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("job");

  const [jobsTabLoading, setJobsTabLoading] = useState(false);
  const [eventsTabLoading, setEventsTabLoading] = useState(false);
  const [talentTabLoading, setTalentTabLoading] = useState(false);

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

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get fresh user data from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Dashboard - storedUser:', storedUser);
      console.log('Dashboard - authUser:', authUser);
      console.log('Dashboard - organizationId:', storedUser?.organizationId || authUser?.organizationId);
      
      const [statsData, analyticsData] = await Promise.all([
        dashboardService.getOrganizerStats(),
        dashboardService.getAnalytics("year"),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      
      // Use storedUser if authUser is not available
      const currentUser = authUser || storedUser;
      
      // Fetch organization data for profile
      console.log('Dashboard - using currentUser:', currentUser);
      console.log('Dashboard - organizationId:', currentUser?.organizationId);
      
      if (currentUser?.organizationId) {
        try {
          const token = localStorage.getItem('token');
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
          const orgResponse = await fetch(`${API_URL}/organizations/${currentUser.organizationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('Organization API response status:', orgResponse.status);
          
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            console.log('Organization data received:', orgData);
            
            const updatedProfileData = {
              fullName: currentUser.fullName || '',
              email: currentUser.email || '',
              phone: currentUser.phone || '',
              city: currentUser.city || '',
              state: currentUser.state || '',
              country: currentUser.country || '',
              bio: currentUser.bio || '',
              role: currentUser.role || '',
              companyName: orgData.name || '',
              industryType: orgData.industry || '',
              companySize: orgData.size || '',
              foundedYear: orgData.foundedYear || '',
              headOffice: orgData.location || '',
              website: orgData.website || '',
              aboutCompany: orgData.description || '',
              // Load preferences data (flatten nested structure)
              workLocations: currentUser?.preferences?.workLocations?.join(', ') || '',
              hiringFor: currentUser?.preferences?.hiringFor?.join(', ') || '',
              totalJobsPosted: currentUser?.preferences?.metrics?.totalJobsPosted || '',
              activeJobs: currentUser?.preferences?.metrics?.activeJobs || '',
              totalCandidatesHired: currentUser?.preferences?.metrics?.totalCandidatesHired || '',
              responseRate: currentUser?.preferences?.metrics?.responseRate || '',
              averageResponseTimeHours: currentUser?.preferences?.metrics?.averageResponseTimeHours || '',
              allowDirectMessage: currentUser?.preferences?.communication?.allowDirectMessage ?? true,
              preferredContact: currentUser?.preferences?.communication?.preferredContact || 'platform_chat',
              supportEmail: currentUser?.preferences?.communication?.supportEmail || ''
            };
            
            console.log('Setting profileData to:', updatedProfileData);
            setProfileData(updatedProfileData);
          }
        } catch (err) {
          console.error('Error fetching organization:', err);
        }
      } else {
        // No organization, check if user has company data stored in profile
        console.log('No organizationId, checking user.company data');
        console.log('currentUser.company:', currentUser?.company);
        
        setProfileData({
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          city: currentUser?.city || '',
          state: currentUser?.state || '',
          country: currentUser?.country || '',
          bio: currentUser?.bio || '',
          role: currentUser?.role || '',
          // Load company data from user.company if exists
          companyName: currentUser?.company?.name || '',
          industryType: currentUser?.company?.industryType || '',
          companySize: currentUser?.company?.companySize || '',
          foundedYear: currentUser?.company?.foundedYear || '',
          headOffice: currentUser?.company?.headOffice || '',
          website: currentUser?.company?.website || '',
          aboutCompany: currentUser?.company?.aboutCompany || '',
          // Load preferences data (flatten nested structure)
          workLocations: currentUser?.preferences?.workLocations?.join(', ') || '',
          hiringFor: currentUser?.preferences?.hiringFor?.join(', ') || '',
          totalJobsPosted: currentUser?.preferences?.metrics?.totalJobsPosted || '',
          activeJobs: currentUser?.preferences?.metrics?.activeJobs || '',
          totalCandidatesHired: currentUser?.preferences?.metrics?.totalCandidatesHired || '',
          responseRate: currentUser?.preferences?.metrics?.responseRate || '',
          averageResponseTimeHours: currentUser?.preferences?.metrics?.averageResponseTimeHours || '',
          allowDirectMessage: currentUser?.preferences?.communication?.allowDirectMessage ?? true,
          preferredContact: currentUser?.preferences?.communication?.preferredContact || 'platform_chat',
          supportEmail: currentUser?.preferences?.communication?.supportEmail || ''
        });
      }
    } catch (error) {
      // error
    } finally {
      setLoading(false);
    }
  };



  const fetchCandidates = async (page = 1, search = "", stage = "") => {
    try {
      setCandidatesLoading(true);
      const candidatesData = await dashboardService.getCandidates({
        page,
        limit: 10,
        search,
        stage,
      });
      setCandidates(candidatesData.candidates);
      setTotalPages(candidatesData.totalPages);
      setCurrentPage(candidatesData.currentPage);
    } catch (error) {
      // error
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (authUser?.role !== "recruiter") {
      let redirectPath = "/candidate-dashboard";
      if (authUser?.role === "admin" || authUser?.role === "superadmin") {
        redirectPath = "/admin-dashboard";
      } else if (authUser?.role === "candidate") {
        redirectPath = "/candidate-dashboard";
      }
      navigate(redirectPath, { replace: true });
      return;
    }

    fetchDashboardData();
    fetchCandidates();
  }, [isAuthenticated, authLoading, authUser, navigate]);



  useEffect(() => {
    if (isAuthenticated && authUser?.role === "recruiter") {
      const timeoutId = setTimeout(() => {
        fetchCandidates(1, searchQuery, selectedStage);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedStage, isAuthenticated, authUser]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const handleTabChange = (tab, modalType = null) => {
    setActiveTab(tab);
    if (modalType) {
      setPendingModalType(modalType);
    }
  };

  const handleModalSuccess = () => {
    fetchDashboardData();
  };

  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="organizer-panel">
          <div className="dashboard-background"></div>
          <div className="preloader">
            <div className="loading-container">
              <div className="loading"></div>
              <div id="loading-icon">
                <img src="assets/img/logo/preloader.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {(preloaderVisible || jobsTabLoading || eventsTabLoading || talentTabLoading) && (
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
          <svg
            className="progress-circle svg-content"
            width="100%"
            height="100%"
            viewBox="-1 -1 102 102"
          >
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div>

      <div className="organizer-panel">
        <div className="dashboard-background"></div>

        <RecruiterHeader
          authUser={authUser}
          notifications={notifications}
          onLogout={handleLogout}
          onOpenSettings={() => setActiveTab("settings")}
          getUserInitials={getUserInitials}
        />

        <div className="organizer-content">
          <RecruiterSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />

          <div className="organizer-main">
            <div className="max-w-[1200px]">
              {activeTab === "dashboard" && (
                <DashboardTab
                  authUser={authUser}
                  stats={stats}
                  analytics={analytics}
                  candidates={candidates}
                  candidatesLoading={candidatesLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedStage={selectedStage}
                  setSelectedStage={setSelectedStage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChangePage={(page) =>
                    fetchCandidates(page, searchQuery, selectedStage)
                  }
                  getUserInitials={getUserInitials}
                  onOpenModal={handleOpenModal}
                  onTabChange={handleTabChange}
                />
              )}

              {activeTab === "jobs" && (
                <ManageJobsTab 
                  authUser={authUser} 
                  setJobsTabLoading={setJobsTabLoading}
                  pendingModalType={pendingModalType}
                  onModalTypeHandled={() => setPendingModalType(null)}
                />
              )}

              {activeTab === "team" && (
                <TeamManagementTab authUser={authUser} onTabChange={setActiveTab} />
              )}

              {activeTab === "evaluate" && (
                <EvaluateCandidatesTab authUser={authUser} />
              )}

              {activeTab === "opportunities" && (
                <ComingSoonTab
                  icon={Star}
                  title="Opportunities"
                  description="Manage career opportunities and openings"
                />
              )}

              {activeTab === "events" && (
                <ManageEventsTab 
                  authUser={authUser} 
                  setEventsTabLoading={setEventsTabLoading}
                  pendingModalType={pendingModalType}
                  onModalTypeHandled={() => setPendingModalType(null)}
                />
              )}

              {activeTab === "assessments" && (
                <ComingSoonTab
                  icon={ClipboardCheck}
                  title="Assessments"
                  description="Create and manage candidate assessments"
                />
              )}

              {activeTab === "talent" && (
                <TalentPipelineTab 
                  authUser={authUser} 
                  setTalentTabLoading={setTalentTabLoading}
                />
              )}

              {activeTab === "settings" && (
                <SettingsTab
                  authUser={authUser}
                  profileData={profileData}
                  setProfileData={setProfileData}
                  isEditingProfile={isEditingProfile}
                  setIsEditingProfile={setIsEditingProfile}
                  getUserInitials={getUserInitials}
                />
              )}
            </div>
          </div>
        </div>

        <AddContentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          type={modalType}
          authUser={authUser}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default RecruiterDashboard;
