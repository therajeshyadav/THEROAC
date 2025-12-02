import { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  Plus,
  ChevronDown,
  Briefcase,
  Calendar,
  Star,
  Search,
  Download,
  Users,
  Trophy,
  ClipboardCheck,
  Phone,
  UserCheck,
  Eye,
  MessageSquare,
  MoreVertical,
} from "lucide-react";

const DashboardTab = ({
  authUser,
  stats,
  analytics,
  candidates,
  candidatesLoading,
  searchQuery,
  setSearchQuery,
  selectedStage,
  setSelectedStage,
  currentPage,
  totalPages,
  onChangePage,
  getUserInitials,
  onOpenModal,
  onTabChange,
}) => {
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const hostButtonRef = useRef(null);

  const getAnalyticsData = () => {
    if (!analytics?.monthlyData) {
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        applications: 0,
        interviews: 0,
      }));
    }
    return analytics.monthlyData;
  };

  const generateChartPath = (data, key, maxValue) => {
    if (!data || data.length === 0) return "M0,300 L800,300";

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 800;
      const y = 300 - (item[key] / maxValue) * 250;
      return `${x},${y}`;
    });

    return `M${points.join(" L")}`;
  };

  const handleStatCardClick = (title) => {
    switch (title) {
      case "Total Candidates":
        // Scroll to candidates table on same page
        const candidatesSection = document.querySelector('.candidates-management-section');
        if (candidatesSection) {
          candidatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      case "Active Events":
        if (onTabChange) onTabChange("festivals"); // Festivals tab
        break;
      case "Active Job & Internships":
        if (onTabChange) onTabChange("jobs"); // Jobs & Internships tab
        break;
      case "Active Assessments":
        if (onTabChange) onTabChange("assessments"); // Assessments tab (coming soon)
        break;
      default:
        break;
    }
  };

  const getStatsData = () => {
    if (!stats) {
      return [
        {
          title: "Total Candidates",
          value: "0",
          icon: Users,
          color: "blue",
          clickable: true,
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
          clickable: true,
          details: [
            { label: "Total", value: "0" },
            { label: "Registrations", value: "0" },
          ],
        },
        {
          title: "Active Job & Internships",
          value: "0",
          icon: Trophy,
          color: "yellow",
          clickable: true,
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
          clickable: true,
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
        clickable: true,
        details: [
          {
            label: "Active Applications",
            value: stats.totalCandidates.toString(),
          },
          {
            label: "New This Week",
            value: stats.newCandidatesThisWeek.toString(),
          },
        ],
      },
      {
        title: "Active Events",
        value: stats.activeEvents.toString(),
        icon: Briefcase,
        color: "pink",
        clickable: true,
        details: [
          { label: "Total", value: stats.activeEvents.toString() },
          {
            label: "Registrations",
            value: stats.totalEventRegistrations.toString(),
          },
        ],
      },
      {
        title: "Active Job & Internships",
        value: stats.activeOpportunities.toString(),
        icon: Trophy,
        color: "yellow",
        clickable: true,
        details: [
          { label: "Total", value: stats.activeOpportunities.toString() },
          {
            label: "Applications",
            value: stats.activeJobApplications.toString(),
          },
        ],
      },
      {
        title: "Active Assessments",
        value: "0",
        icon: ClipboardCheck,
        color: "orange",
        clickable: true,
        details: [{ label: "Upgrade to unlock", value: "" }],
      },
    ];
  };

  const calculateDropdownPosition = () => {
    if (hostButtonRef.current) {
      const rect = hostButtonRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + 8,
        left: rect.right - 220,
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showHostDropdown &&
        !event.target.closest(".host-dropdown-container") &&
        !event.target.closest(".host-dropdown")
      ) {
        setShowHostDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHostDropdown]);

  const chartData = getAnalyticsData();
  const maxApplications = Math.max(...chartData.map((d) => d.applications), 1);
  const maxInterviews = Math.max(...chartData.map((d) => d.interviews), 1);
  const maxValue = Math.max(maxApplications, maxInterviews, 10);
  const applicationsPath = generateChartPath(chartData, "applications", maxValue);
  const interviewsPath = generateChartPath(chartData, "interviews", maxValue);

  return (
    <>
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h2>
            Welcome Back, {authUser?.name || authUser?.fullName || "Recruiter"} 👋
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
                  left: `${dropdownPosition.left}px`,
                }}
              >
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onOpenModal("job");
                    setShowHostDropdown(false);
                  }}
                >
                  <Briefcase className="w-4 h-4" />
                  Add Job Posting
                </button>
                {(authUser?.role === "recruiter" ||
                  authUser?.role === "organizer" ||
                  authUser?.role === "admin" ||
                  authUser?.role === "superadmin") && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onOpenModal("event");
                      setShowHostDropdown(false);
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Create Event
                  </button>
                )}
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onOpenModal("hub-content");
                    setShowHostDropdown(false);
                  }}
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
            className={`stat-card ${stat.color} enhanced-card ${stat.clickable ? 'clickable' : ''}`}
            onClick={() => stat.clickable && handleStatCardClick(stat.title)}
            style={{ cursor: stat.clickable ? 'pointer' : 'default' }}
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

      {/* Analytics + Calendar */}
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
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD600" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFD600" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="orangeGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGold" x1="0%" y1="0%" x2="100%" y2="0%">
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
              {[37.5, 75, 112.5, 150, 187.5, 225, 262.5].map((y, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="800"
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Applications line + area */}
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

              {/* Interviews line + area */}
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

              {/* Sample points */}
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
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot gold"></div>
              <span>
                Applications Received (
                {chartData.reduce((sum, item) => sum + item.applications, 0)})
              </span>
            </div>
            <div className="legend-item">
              <div className="legend-dot orange"></div>
              <span>
                Interviews Conducted (
                {chartData.reduce((sum, item) => sum + item.interviews, 0)})
              </span>
            </div>
          </div>
        </div>

        {/* Activity Calendar (static) */}
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
              {/* Same static cells as original */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, idx) => (
                  <div className="day-column" key={day}>
                    <span className="day-label">{day}</span>
                    {idx === 0 || idx === 6 ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="activity-cell empty"></div>
                      ))
                    ) : idx === 1 ? (
                      <>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                      </>
                    ) : idx === 2 ? (
                      <>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                      </>
                    ) : idx === 3 ? (
                      <>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                      </>
                    ) : idx === 4 ? (
                      <>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-4"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                      </>
                    ) : (
                      <>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-3"></div>
                        <div className="activity-cell level-2"></div>
                        <div className="activity-cell level-1"></div>
                        <div className="activity-cell empty"></div>
                      </>
                    )}
                  </div>
                )
              )}
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
            <div
              className="preloader"
              style={{ position: "relative", height: "200px" }}
            >
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate, index) => (
                    <tr key={index} className="candidate-row">
                      <td>
                        <div className="candidate-info">
                          <div className="candidate-avatar">
                            <span>{getUserInitials(candidate.name)}</span>
                          </div>
                          <div className="candidate-details">
                            <div className="candidate-name">{candidate.name}</div>
                            <div className="candidate-email">{candidate.email}</div>
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
                          <div className="score-number">{candidate.score}</div>
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

          {!candidatesLoading && candidates.length > 0 && totalPages > 1 && (
            <div
              className="pagination-container"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <button
                onClick={() => onChangePage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    currentPage === 1 ? "rgba(255,255,255,0.1)" : "#FFD600",
                  color:
                    currentPage === 1 ? "rgba(255,255,255,0.5)" : "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onChangePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    currentPage === totalPages
                      ? "rgba(255,255,255,0.1)"
                      : "#FFD600",
                  color:
                    currentPage === totalPages
                      ? "rgba(255,255,255,0.5)"
                      : "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
