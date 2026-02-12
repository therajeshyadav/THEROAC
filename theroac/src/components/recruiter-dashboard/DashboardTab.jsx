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
import HostModal from "./HostModal";

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
  const [showHostModal, setShowHostModal] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('year');
  
  // Fetch activity heatmap data
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${API_URL}/dashboard/activity-heatmap`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHeatmapData(data.heatmap);
        }
      } catch (error) {
        console.error('Failed to fetch heatmap:', error);
      }
    };
    fetchHeatmap();
  }, []);

  const getAnalyticsData = () => {
    if (!analytics?.monthlyData) {
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        applications: 0,
        interviews: 0,
      }));
    }
    
    // Filter data based on selected period
    const allData = analytics.monthlyData;
    const currentMonth = new Date().getMonth();
    
    switch (chartPeriod) {
      case 'today':
        // Show only current month for "today" view
        return [allData[currentMonth] || { month: new Date().toLocaleString("default", { month: "short" }), applications: 0, interviews: 0 }];
      
      case 'week':
        // Show last month data (approximation for week)
        return allData.slice(-2);
      
      case 'month':
        // Show last 3 months
        return allData.slice(-3);
      
      case 'year':
      default:
        // Show all 12 months
        return allData;
    }
  };

  const generateChartPath = (data, key, maxValue) => {
    if (!data || data.length === 0) return "M40,300 L760,300";

    const padding = 40;
    const availableWidth = 800 - (padding * 2);
    
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * availableWidth;
      const y = 300 - (item[key] / maxValue) * 250;
      return `${x},${y}`;
    });

    return `M${points.join(" L")}`;
  };

  const handleStatCardClick = (title) => {
    switch (title) {
      case "Total Candidates":
        if (onTabChange) onTabChange("evaluate"); // Navigate to Evaluate Candidates tab
        break;
      case "Active Events":
        if (onTabChange) onTabChange("events"); // Events tab
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
    // No longer needed - using modal instead
  };

  const handleHostDropdownToggle = () => {
    setShowHostModal(!showHostModal);
  };

  useEffect(() => {
    // No longer needed - modal handles its own closing
  }, [showHostModal]);

  const chartData = getAnalyticsData();
  const maxApplications = Math.max(...chartData.map((d) => d.applications), 1);
  const maxInterviews = Math.max(...chartData.map((d) => d.interviews), 1);
  const actualMax = Math.max(maxApplications, maxInterviews);
  // Round up to next nice number for better scale
  const maxValue = actualMax <= 5 ? 5 : actualMax <= 10 ? 10 : Math.ceil(actualMax / 10) * 10;
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
          <button
            className="btn-host"
            onClick={handleHostDropdownToggle}
          >
            <Plus className="w-4 h-4" /> Host
          </button>
          <button className="btn-help">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Host Modal */}
      <HostModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        onTabChange={onTabChange}
        onOpenModal={onOpenModal}
        authUser={authUser}
      />

      {/* Stats Cards */}
      <div className="recruiter-stats-grid">
        {getStatsData().map((stat, index) => (
          <div 
            key={index} 
            className={`recruiter-stat-card recruiter-${stat.color} ${stat.clickable ? 'clickable' : ''}`}
            onClick={() => stat.clickable && handleStatCardClick(stat.title)}
            style={{ cursor: stat.clickable ? 'pointer' : 'default' }}
          >
            <div className="recruiter-stat-icon-row">
              <div className="recruiter-stat-icon">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="recruiter-stat-number">{stat.value}</div>
            </div>

            <div className="recruiter-stat-info">
              <div className="recruiter-stat-label">{stat.title}</div>
              {stat.details.map((detail, idx) => (
                <div key={idx} className="recruiter-stat-details">
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
              <button 
                className={`chart-tab ${chartPeriod === 'today' ? 'active' : ''}`}
                onClick={() => setChartPeriod('today')}
              >
                Today
              </button>
              <button 
                className={`chart-tab ${chartPeriod === 'week' ? 'active' : ''}`}
                onClick={() => setChartPeriod('week')}
              >
                Last week
              </button>
              <button 
                className={`chart-tab ${chartPeriod === 'month' ? 'active' : ''}`}
                onClick={() => setChartPeriod('month')}
              >
                Last month
              </button>
              <button 
                className={`chart-tab ${chartPeriod === 'year' ? 'active' : ''}`}
                onClick={() => setChartPeriod('year')}
              >
                Year
              </button>
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

              {/* Dynamic data points for Applications */}
              {chartData.map((item, index) => {
                if (item.applications > 0) {
                  const padding = 40;
                  const availableWidth = 800 - (padding * 2);
                  const x = padding + (index / (chartData.length - 1)) * availableWidth;
                  const y = 300 - (item.applications / maxValue) * 250;
                  return (
                    <circle
                      key={`app-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#FFD600"
                      stroke="#1a1a1a"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })}
              
              {/* Dynamic data points for Interviews */}
              {chartData.map((item, index) => {
                if (item.interviews > 0) {
                  const padding = 40;
                  const availableWidth = 800 - (padding * 2);
                  const x = padding + (index / (chartData.length - 1)) * availableWidth;
                  const y = 300 - (item.interviews / maxValue) * 250;
                  return (
                    <circle
                      key={`int-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#F59E0B"
                      stroke="#1a1a1a"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })}

              {/* Month labels */}
              {chartData.map((item, index) => {
                // Add padding: 40px from edges, distribute remaining 720px
                const padding = 40;
                const availableWidth = 800 - (padding * 2);
                const x = padding + (index / (chartData.length - 1)) * availableWidth;
                
                return (
                  <text
                    key={index}
                    x={x}
                    y="295"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {item.month}
                  </text>
                );
              })}
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
              {heatmapData ? (
                // Dynamic heatmap from backend
                heatmapData.map((dayData) => (
                  <div className="day-column" key={dayData.day}>
                    <span className="day-label">{dayData.day}</span>
                    {dayData.hours.map((hourData, idx) => (
                      <div 
                        key={idx} 
                        className={`activity-cell ${hourData.level === 0 ? 'empty' : `level-${hourData.level}`}`}
                        title={`${dayData.day} ${hourData.time}: ${hourData.count} activities`}
                      ></div>
                    ))}
                  </div>
                ))
              ) : (
                // Loading state - show empty cells
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div className="day-column" key={day}>
                    <span className="day-label">{day}</span>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="activity-cell empty"></div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default DashboardTab;
