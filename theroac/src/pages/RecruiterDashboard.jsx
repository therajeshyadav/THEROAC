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
import JobsTab from "../components/recruiter-dashboard/JobsTab";
import ComingSoonTab from "../components/recruiter-dashboard/ComingSoonTab";
import SettingsTab from "../components/recruiter-dashboard/SettingsTab";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } =
    useAuth();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "dashboard"
  );
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

  const [myJobs, setMyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

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
      const [statsData, analyticsData] = await Promise.all([
        dashboardService.getOrganizerStats(),
        dashboardService.getAnalytics("year"),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      // error
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await fetch("http://localhost:4000/api/jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      const userJobs =
        data.jobs?.filter((job) => job.createdBy === authUser?.id) || [];
      setMyJobs(userJobs);
    } catch (error) {
      setMyJobs([]);
    } finally {
      setJobsLoading(false);
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
    if (activeTab === "jobs" && authUser?.id) {
      fetchMyJobs();
    }
  }, [activeTab, authUser?.id]);

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

  const handleModalSuccess = () => {
    fetchDashboardData();
  };

  if (authLoading) {
    return (
      <div className="organizer-panel">
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
    <div className="auth-container">
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
                />
              )}

              {activeTab === "jobs" && (
                <JobsTab
                  myJobs={myJobs}
                  jobsLoading={jobsLoading}
                  onAddJob={() => handleOpenModal("job")}
                />
              )}

              {activeTab === "evaluate" && (
                <ComingSoonTab
                  icon={UserCheck}
                  title="Evaluate Candidates"
                  description="Review and assess candidate applications"
                />
              )}

              {activeTab === "opportunities" && (
                <ComingSoonTab
                  icon={Star}
                  title="Opportunities"
                  description="Manage career opportunities and openings"
                />
              )}

              {activeTab === "festivals" && (
                <ComingSoonTab
                  icon={Calendar}
                  title="Festivals & Events"
                  description="Create and manage recruitment festivals"
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
                <ComingSoonTab
                  icon={Users}
                  title="Talent Pipeline"
                  description="Build and manage your talent pipeline"
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
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default RecruiterDashboard;
