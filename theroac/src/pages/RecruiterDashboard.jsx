import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const preloaderVisible = usePreloader(300);

  const handleLogout = () => {
    // Use the AuthContext logout function to properly clear state
    logout();
    // Redirect to home page and replace history
    navigate("/", { replace: true });
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
      console.error('Error fetching dashboard data:', error);
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
        stage
      });
      setCandidates(candidatesData.candidates);
      setTotalPages(candidatesData.totalPages);
      setCurrentPage(candidatesData.currentPage);
    } catch (error) {
      console.error('Error fetching candidates:', error);
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
      navigate("/login");
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
    fetchCandidates();
  }, [isAuthenticated, authLoading, authUser, navigate]);

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
      if (showHostDropdown && !event.target.closest('.host-dropdown-container')) {
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
        <div className="dashboard-background"></div>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
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
            <div className="logo-section">
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
                <div className="user-avatar">
                  <span>
                    {getUserInitials(authUser?.name || authUser?.fullName)}
                  </span>
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
              <button className="nav-item">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="organizer-main">
            <div className="max-w-[1200px]">
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
                      className="btn-host"
                      onClick={() => setShowHostDropdown(!showHostDropdown)}
                    >
                      <Plus className="w-4 h-4" /> Host
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showHostDropdown && (
                      <div className="host-dropdown">
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenModal('job')}
                        >
                          <Briefcase className="w-4 h-4" />
                          Add Job Posting
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenModal('event')}
                        >
                          <Calendar className="w-4 h-4" />
                          Create Event
                        </button>
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
                    <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
                      <div className="loading-spinner">
                        <div className="spinner"></div>
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
