import { useState, useEffect, useRef } from "react";
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
  Bell,
  Settings,
  Download,
  Plus,
  Search,
  TrendingUp,
  MessageSquare,
  Eye,
  MoreVertical,
  HelpCircle,
  Grid,
  ClipboardCheck,
  Star,
  Trophy,
  Phone,
  LogOut,
  ChevronDown,
} from "lucide-react";
import "./RecruiterDashboard.css";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "dashboard");
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
  const [modalType, setModalType] = useState('job');
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [myJobs, setMyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
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
  const hostButtonRef = useRef(null);
  const preloaderVisible = usePreloader(300);

  const handleLogout = () => {
    // Use the AuthContext logout function to properly clear state
    logout();
    // Redirect to home page with full page reload
    window.location.href = '/';
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
        dashboardService.getAnalytics('year')
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      // Error fetching dashboard data
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      setJobsLoading(true);
      // Fetch jobs created by this recruiter
      const response = await fetch('http://localhost:4000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      // Filter jobs created by current user
      const userJobs = data.jobs?.filter(job => job.createdBy === authUser?.id) || [];
      setMyJobs(userJobs);
    } catch (error) {
      // Error fetching jobs
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
        stage
      });
      setCandidates(candidatesData.candidates);
      setTotalPages(candidatesData.totalPages);
      setCurrentPage(candidatesData.currentPage);
    } catch (error) {
      // Error fetching candidates
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

    // Check if user is a recruiter
    if (authUser?.role !== "recruiter") {
      // Redirect to appropriate dashboard based on user role
      let redirectPath = '/candidate-dashboard';
      if (authUser?.role === 'admin' || authUser?.role === 'superadmin') {
        redirectPath = '/admin-dashboard';
      } else if (authUser?.role === 'candidate') {
        redirectPath = '/candidate-dashboard';
      }
      navigate(redirectPath, { replace: true });
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
    fetchCandidates();
  }, [isAuthenticated, authLoading, authUser, navigate]);

  // Fetch jobs when jobs tab is active
  useEffect(() => {
    if (activeTab === "jobs" && authUser?.id) {
      fetchMyJobs();
    }
  }, [activeTab, authUser?.id]);

  // Fetch candidates when search or filter changes
  useEffect(() => {
    if (isAuthenticated && authUser?.role === "recruiter") {
      const timeoutId = setTimeout(() => {
        fetchCandidates(1, searchQuery, selectedStage);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedStage, isAuthenticated, authUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHostDropdown &&
        !event.target.closest('.host-dropdown-container') &&
        !event.target.closest('.host-dropdown')) {
        setShowHostDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHostDropdown]);

  // Show loading state
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

  const getAnalyticsData = () => {
    if (!analytics?.monthlyData) {
      // Return default data if no analytics available
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        applications: 0,
        interviews: 0
      }));
    }
    return analytics.monthlyData;
  };

  const generateChartPath = (data, key, maxValue) => {
    if (!data || data.length === 0) return "M0,300 L800,300";

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 800;
      const y = 300 - ((item[key] / maxValue) * 250); // Scale to chart height
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  const getStatsData = () => {
    if (!stats) {
      return [
        {
          title: "Total Candidates",
          value: "0",
          icon: Users,
          color: "blue",
          details: [
            { label: "Active Applications", value: "0" },
            { label: "New This Week", value: "0" },
          ],
        },
        {
          title: "Active Events",
          value: "0",
          icon: Briefcase,
          color: "pink",
          details: [
            { label: "Total", value: "0" },
            { label: "Registrations", value: "0" },
          ],
        },
        {
          title: "Active Opportunities",
          value: "0",
          icon: Trophy,
          color: "yellow",
          details: [
            { label: "Total", value: "0" },
            { label: "Applications", value: "0" },
          ],
        },
        {
          title: "Active Assessments",
          value: "0",
          icon: ClipboardCheck,
          color: "orange",
          details: [{ label: "Upgrade to unlock", value: "" }],
        },
      ];
    }

    return [
      {
        title: "Total Candidates",
        value: stats.totalCandidates.toString(),
        icon: Users,
        color: "blue",
        details: [
          { label: "Active Applications", value: stats.totalCandidates.toString() },
          { label: "New This Week", value: stats.newCandidatesThisWeek.toString() },
        ],
      },
      {
        title: "Active Events",
        value: stats.activeEvents.toString(),
        icon: Briefcase,
        color: "pink",
        details: [
          { label: "Total", value: stats.activeEvents.toString() },
          { label: "Registrations", value: stats.totalEventRegistrations.toString() },
        ],
      },
      {
        title: "Active Opportunities",
        value: stats.activeOpportunities.toString(),
        icon: Trophy,
        color: "yellow",
        details: [
          { label: "Total", value: stats.activeOpportunities.toString() },
          { label: "Applications", value: stats.activeJobApplications.toString() },
        ],
      },
      {
        title: "Active Assessments",
        value: "0",
        icon: ClipboardCheck,
        color: "orange",
        details: [{ label: "Upgrade to unlock", value: "" }],
      },
    ];
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
    setShowHostDropdown(false);
  };

  const handleModalSuccess = () => {
    // Refresh dashboard data after successful creation
    fetchDashboardData();
  };

  const calculateDropdownPosition = () => {
    if (hostButtonRef.current) {
      const rect = hostButtonRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + 8,
        left: rect.right - 220 // 220px is the min-width of dropdown
      };
      setDropdownPosition(position);
    }
  };

  const handleHostDropdownToggle = () => {
    if (!showHostDropdown) {
      calculateDropdownPosition();
    }
    setShowHostDropdown(!showHostDropdown);
  };

  const navItems = [
    { id: "dashboard", icon: Grid, label: "Dashboard" },
    { id: "evaluate", icon: UserCheck, label: "Evaluate Candidates" },
    { id: "jobs", icon: Briefcase, label: "Jobs & Internships" },
    { id: "opportunities", icon: Star, label: "Opportunities" },
    { id: "festivals", icon: Calendar, label: "Festivals" },
    { id: "assessments", icon: ClipboardCheck, label: "Assessments" },
    { id: "talent", icon: Users, label: "Talent Pipeline" },
  ];


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

        {/* Top Header */}
        <div className="organizer-header">
          <div className="header-left">
            <div className="logo-section" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
              <img
                src="assets/img/logo/logo5.png"
                alt="ROAC Logo"
                className="dashboard-logo"
              />
            </div>
          </div>
          <div className="header-center">
            <h1 className="panel-title">Organizer Panel</h1>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">
                <TrendingUp className="w-4 h-4" />
                <span className="ml-2">Upgrade</span>
              </button>
              <button className="notification-btn">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="notification-btn">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </button>
              <div className="user-profile">
                <div 
                  className="user-avatar"
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer' }}
                  title="View Profile"
                >
                  {authUser?.profilePicture || authUser?.avatar ? (
                    <img 
                      src={authUser.profilePicture || authUser.avatar} 
                      alt={authUser.name || authUser.fullName || 'User'} 
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
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="organizer-content">
          {/* Left Sidebar */}
          <div
            className={`organizer-sidebar ${sidebarExpanded ? "expanded" : ""}`}
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
          >
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? "active" : ""
                    }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-bottom">
              <button className="nav-item">
                <Download className="w-5 h-5" />
                <span>My Download(s)</span>
              </button>
              <button 
                className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="organizer-main">
            <div className="max-w-[1200px]">
              
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <>
              {/* Welcome Section */}
              <div className="welcome-section">
                <div className="welcome-text">
                  <h2>
                    Welcome Back,{" "}
                    {authUser?.name || authUser?.fullName || "Recruiter"} 👋
                  </h2>
                  <p>
                    Here is the summary of overall performance{" "}
                    <HelpCircle className="inline w-4 h-4" />
                  </p>
                </div>
                <div className="welcome-actions">
                  <div className="host-dropdown-container">
                    <button
                      ref={hostButtonRef}
                      className="btn-host"
                      onClick={handleHostDropdownToggle}
                    >
                      <Plus className="w-4 h-4" /> Host
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showHostDropdown && (
                      <div
                        className="host-dropdown"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`
                        }}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenModal('job')}
                        >
                          <Briefcase className="w-4 h-4" />
                          Add Job Posting
                        </button>
                        {(authUser?.role === 'recruiter' || authUser?.role === 'organizer' || authUser?.role === 'admin' || authUser?.role === 'superadmin') && (
                          <button
                            className="dropdown-item"
                            onClick={() => handleOpenModal('event')}
                          >
                            <Calendar className="w-4 h-4" />
                            Create Event
                          </button>
                        )}
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenModal('hub-content')}
                        >
                          <Star className="w-4 h-4" />
                          Add Career Insight
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="btn-help">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                {getStatsData().map((stat, index) => (
                  <div
                    key={index}
                    className={`stat-card ${stat.color} enhanced-card`}
                  >
                    <div className="stat-icon-row">
                      <div className="stat-icon">
                        <stat.icon className="w-6 h-6" />
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

              {/* Analytics Dashboard Grid */}
              <div className="dashboard-analytics-grid">
                {/* Recruitment Analytics Chart */}
                <div className="analytics-chart-section">
                  <div className="chart-header">
                    <div className="chart-title-section">
                      <h3>Recruitment Analytics Overview</h3>
                      <p>Track hiring trends and performance</p>
                    </div>
                    <div className="chart-tabs">
                      <button className="chart-tab">Today</button>
                      <button className="chart-tab">Last week</button>
                      <button className="chart-tab">Last month</button>
                      <button className="chart-tab active">Year</button>
                    </div>
                  </div>
                  <div className="analytics-chart-container">
                    {(() => {
                      const chartData = getAnalyticsData();
                      const maxApplications = Math.max(...chartData.map(d => d.applications), 1);
                      const maxInterviews = Math.max(...chartData.map(d => d.interviews), 1);
                      const maxValue = Math.max(maxApplications, maxInterviews, 10);

                      return (
                        <>
                          <div className="chart-y-axis">
                            <span>{maxValue}</span>
                            <span>{Math.round(maxValue * 0.875)}</span>
                            <span>{Math.round(maxValue * 0.75)}</span>
                            <span>{Math.round(maxValue * 0.625)}</span>
                            <span>{Math.round(maxValue * 0.5)}</span>
                            <span>{Math.round(maxValue * 0.375)}</span>
                            <span>{Math.round(maxValue * 0.25)}</span>
                            <span>0</span>
                          </div>
                          <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 800 300"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient
                                id="goldGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#FFD600"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#FFD600"
                                  stopOpacity="0"
                                />
                              </linearGradient>
                              <linearGradient
                                id="orangeGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#F59E0B"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#F59E0B"
                                  stopOpacity="0"
                                />
                              </linearGradient>
                              <linearGradient
                                id="lineGold"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#FFD600" />
                                <stop offset="50%" stopColor="#FFC107" />
                                <stop offset="100%" stopColor="#FFD600" />
                              </linearGradient>
                              <linearGradient
                                id="lineOrange"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="50%" stopColor="#FF6B00" />
                                <stop offset="100%" stopColor="#F59E0B" />
                              </linearGradient>
                            </defs>

                            {/* Grid lines */}
                            <line
                              x1="0"
                              y1="37.5"
                              x2="800"
                              y2="37.5"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="75"
                              x2="800"
                              y2="75"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="112.5"
                              x2="800"
                              y2="112.5"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="150"
                              x2="800"
                              y2="150"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="187.5"
                              x2="800"
                              y2="187.5"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="225"
                              x2="800"
                              y2="225"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="262.5"
                              x2="800"
                              y2="262.5"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1"
                            />

                            {/* Applications line with area */}
                            {(() => {
                              const applicationsPath = generateChartPath(chartData, 'applications', maxValue);
                              return (
                                <>
                                  <path
                                    d={`${applicationsPath} L800,300 L0,300 Z`}
                                    fill="url(#goldGradient)"
                                  />
                                  <path
                                    d={applicationsPath}
                                    stroke="url(#lineGold)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </>
                              );
                            })()}

                            {/* Interviews line with area */}
                            {(() => {
                              const interviewsPath = generateChartPath(chartData, 'interviews', maxValue);
                              return (
                                <>
                                  <path
                                    d={`${interviewsPath} L800,300 L0,300 Z`}
                                    fill="url(#orangeGradient)"
                                  />
                                  <path
                                    d={interviewsPath}
                                    stroke="url(#lineOrange)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </>
                              );
                            })()}

                            {/* Data points */}
                            <circle
                              cx="400"
                              cy="150"
                              r="5"
                              fill="#FFD600"
                              stroke="#1a1a1a"
                              strokeWidth="2"
                            />
                            <circle
                              cx="400"
                              cy="190"
                              r="5"
                              fill="#F59E0B"
                              stroke="#1a1a1a"
                              strokeWidth="2"
                            />

                            {/* Month labels */}
                            {chartData.map((item, index) => (
                              <text
                                key={index}
                                x={(index / (chartData.length - 1)) * 800}
                                y="295"
                                fill="rgba(255,255,255,0.5)"
                                fontSize="12"
                                textAnchor="middle"
                              >
                                {item.month}
                              </text>
                            ))}
                          </svg>
                        </>
                      );
                    })()}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-dot gold"></div>
                      <span>Applications Received ({getAnalyticsData().reduce((sum, item) => sum + item.applications, 0)})</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot orange"></div>
                      <span>Interviews Conducted ({getAnalyticsData().reduce((sum, item) => sum + item.interviews, 0)})</span>
                    </div>
                  </div>
                </div>

                {/* Activity Calendar */}
                <div className="activity-calendar-section">
                  <div className="calendar-header">
                    <h3>Event Insights</h3>
                    <p>Real-time event participation report</p>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-time-labels">
                      <span>10:30</span>
                      <span>10:00</span>
                      <span>09:30</span>
                      <span>09:00</span>
                      <span>08:30</span>
                      <span>08:00</span>
                    </div>
                    <div className="calendar-days">
                      <div className="day-column">
                        <span className="day-label">Sun</span>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Mon</span>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Tue</span>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Wed</span>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Thu</span>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Fri</span>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell empty"></div>
                      </div>
                      <div className="day-column">
                        <span className="day-label">Sat</span>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                        <div className="activity-cell empty"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidates Table */}
              <div className="candidates-management-section">
                <div className="section-header">
                  <div className="header-actions">
                    <div className="search-box enhanced">
                      <Search className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      className="filter-select modern"
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                    >
                      <option value="">All Stages</option>
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button className="export-btn modern">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="candidates-table modern">
                  {candidatesLoading ? (
                    <div className="preloader" style={{ position: 'relative', height: '200px' }}>
                      <div className="loading-container">
                        <div className="loading"></div>
                        <div id="loading-icon">
                          <img src="assets/img/logo/preloader.png" alt="" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Position</th>
                          <th>Stage</th>
                          <th>Applied Date</th>
                          <th>Score</th>
                          <th>Next Action</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                              No candidates found
                            </td>
                          </tr>
                        ) : (
                          candidates.map((candidate, index) => (
                            <tr key={index} className="candidate-row">
                              <td>
                                <div className="candidate-info">
                                  <div className="candidate-avatar">
                                    <span>
                                      {getUserInitials(candidate.name)}
                                    </span>
                                  </div>
                                  <div className="candidate-details">
                                    <div className="candidate-name">
                                      {candidate.name}
                                    </div>
                                    <div className="candidate-email">
                                      {candidate.email}
                                    </div>
                                    <div className="candidate-location">
                                      {candidate.location}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="position-info">
                                  <div className="position-title">
                                    {candidate.position}
                                  </div>
                                  <div className="position-department">
                                    {candidate.department}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`stage-badge ${candidate.stage.toLowerCase()}`}
                                >
                                  {candidate.stage}
                                </span>
                              </td>
                              <td>
                                <div className="date-info">
                                  <div>{candidate.appliedDate}</div>
                                  <div className="time-ago">
                                    {candidate.daysAgo} days ago
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="score-display">
                                  <div className="score-number">
                                    {candidate.score}
                                  </div>
                                  <div className="score-bar">
                                    <div
                                      className="score-fill"
                                      style={{ width: `${candidate.score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="next-action">
                                  {candidate.stage === "interview" ? (
                                    <Calendar className="w-4 h-4" />
                                  ) : candidate.stage === "applied" ? (
                                    <Phone className="w-4 h-4" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                  {candidate.nextAction}
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-btn view"
                                    title="View Profile"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="action-btn message"
                                    title="Send Message"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="action-btn more"
                                    title="More Options"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Pagination */}
                  {!candidatesLoading && candidates.length > 0 && totalPages > 1 && (
                    <div className="pagination-container" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <button
                        onClick={() => fetchCandidates(currentPage - 1, searchQuery, selectedStage)}
                        disabled={currentPage === 1}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: currentPage === 1 ? 'rgba(255,255,255,0.1)' : '#FFD600',
                          color: currentPage === 1 ? 'rgba(255,255,255,0.5)' : '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Previous
                      </button>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => fetchCandidates(currentPage + 1, searchQuery, selectedStage)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : '#FFD600',
                          color: currentPage === totalPages ? 'rgba(255,255,255,0.5)' : '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
              </>
              )}

              {/* Jobs & Internships Tab */}
              {activeTab === "jobs" && (
                <div className="jobs-internships-section">
                  <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <div className="header-left">
                      <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                        My Jobs & Internships
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0 0 0' }}>
                        Manage your job postings and internship opportunities
                      </p>
                    </div>
                    <button 
                      className="btn-host"
                      onClick={() => handleOpenModal('job')}
                      style={{ marginLeft: 'auto' }}
                    >
                      <Plus className="w-4 h-4" /> Add New Job
                    </button>
                  </div>

                  {/* Jobs List */}
                  <div className="jobs-grid">
                    {jobsLoading ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.7)' }}>
                        <div className="loading"></div>
                        <p>Loading your jobs...</p>
                      </div>
                    ) : myJobs.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {myJobs.map((job) => (
                          <div key={job.id} className="event-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                            <div className="event-header" style={{ marginBottom: '1rem' }}>
                              <div className="event-info">
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{job.title}</h3>
                                <p style={{ color: '#FFD600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{job.companyName}</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                  {job.location || 'Remote'} • {job.jobType || 'Full-time'}
                                </p>
                              </div>
                            </div>
                            <div className="event-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                <Eye className="w-4 h-4" style={{ color: '#FFD600' }} />
                                <span>{job.views || 0} views</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                <Users className="w-4 h-4" style={{ color: '#FFD600' }} />
                                <span>{job.applications || 0} applications</span>
                              </div>
                            </div>
                            <div className="event-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                              <span className="status-badge" style={{ padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600', background: job.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(255,68,68,0.2)', color: job.status === 'open' ? '#10B981' : '#FF4444', textTransform: 'uppercase' }}>
                                {job.status || 'open'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="coming-soon-container">
                        <div className="coming-soon-content">
                          <Briefcase className="coming-soon-icon" size={64} />
                          <h2>No Jobs Yet</h2>
                          <p>Jobs and internships you create will appear here</p>
                          <button 
                            className="btn-host"
                            onClick={() => handleOpenModal('job')}
                            style={{ marginTop: '1rem' }}
                          >
                            <Plus className="w-4 h-4" /> Create Your First Job
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Evaluate Candidates Tab */}
              {activeTab === "evaluate" && (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <UserCheck className="coming-soon-icon" size={64} />
                    <h2>Evaluate Candidates</h2>
                    <p>Review and assess candidate applications</p>
                    <span className="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Opportunities Tab */}
              {activeTab === "opportunities" && (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <Star className="coming-soon-icon" size={64} />
                    <h2>Opportunities</h2>
                    <p>Manage career opportunities and openings</p>
                    <span className="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Festivals Tab */}
              {activeTab === "festivals" && (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <Calendar className="coming-soon-icon" size={64} />
                    <h2>Festivals & Events</h2>
                    <p>Create and manage recruitment festivals</p>
                    <span className="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Assessments Tab */}
              {activeTab === "assessments" && (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <ClipboardCheck className="coming-soon-icon" size={64} />
                    <h2>Assessments</h2>
                    <p>Create and manage candidate assessments</p>
                    <span className="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Talent Pipeline Tab */}
              {activeTab === "talent" && (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <Users className="coming-soon-icon" size={64} />
                    <h2>Talent Pipeline</h2>
                    <p>Build and manage your talent pipeline</p>
                    <span className="coming-soon-badge">Coming Soon</span>
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
                        Manage your account information and preferences
                      </p>
                    </div>
                  </div>

                  <div className="profile-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: '20px', padding: '2rem', maxWidth: '800px' }}>
                    {/* Profile Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
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
                          {authUser?.fullName || authUser?.name || 'Recruiter'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                          {authUser?.email}
                        </p>
                        <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: 'rgba(255,214,0,0.2)', color: '#FFD600', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
                          {authUser?.role || 'Recruiter'}
                        </span>
                      </div>
                      {!isEditingProfile && (
                        <button 
                          className="btn-host"
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
                            rows={4}
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => setIsEditingProfile(false)}
                            style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-host"
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
                                  window.location.reload();
                                }
                              } catch (error) {
                                // Error updating profile
                              }
                            }}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="profile-details">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                          <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              Phone
                            </label>
                            <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                              {authUser?.phone || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              Location
                            </label>
                            <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                              {[authUser?.city, authUser?.state, authUser?.country].filter(Boolean).join(', ') || 'Not provided'}
                            </p>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              Bio
                            </label>
                            <p style={{ color: '#fff', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
                              {authUser?.bio || 'No bio added yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Add Content Modal */}
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
