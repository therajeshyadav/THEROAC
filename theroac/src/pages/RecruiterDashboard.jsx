import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Briefcase, Calendar, UserCheck, Bell,
  Settings, Download, Plus, Search, TrendingUp,
  MessageSquare, Eye, MoreVertical,
  HelpCircle, Grid, ClipboardCheck, Star, Trophy, Phone, LogOut
} from 'lucide-react';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [notifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    // Redirect to home page
    navigate('/');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is a recruiter
    if (authUser?.role !== 'recruiter') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, authUser, navigate]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="organizer-panel">
        <div className="dashboard-background"></div>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Candidates',
      value: '0',
      icon: Users,
      color: 'blue',
      details: [
        { label: 'Active Applications', value: '247' },
        { label: 'New This Week', value: '89' }
      ]
    },
    {
      title: 'Active J&I',
      value: '0',
      icon: Briefcase,
      color: 'pink',
      details: [
        { label: 'Total', value: '0' },
        { label: 'Registrations', value: '0' }
      ]
    },
    {
      title: 'Active Opportunities',
      value: '0',
      icon: Trophy,
      color: 'yellow',
      details: [
        { label: 'Total', value: '0' },
        { label: 'Registrations', value: '0' }
      ]
    },
    {
      title: 'Active Assessments',
      value: '0',
      icon: ClipboardCheck,
      color: 'orange',
      details: [
        { label: 'Upgrade to unlock', value: '' }
      ]
    }
  ];

  const navItems = [
    { id: 'dashboard', icon: Grid, label: 'Dashboard' },
    { id: 'evaluate', icon: UserCheck, label: 'Evaluate Candidates' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs & Internships' },
    { id: 'opportunities', icon: Star, label: 'Opportunities' },
    { id: 'festivals', icon: Calendar, label: 'Festivals' },
    { id: 'assessments', icon: ClipboardCheck, label: 'Assessments' },
    { id: 'talent', icon: Users, label: 'Talent Pipeline' },
  ];


  const candidates = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      position: 'Senior Frontend Developer',
      department: 'Engineering',
      stage: 'Interview',
      appliedDate: 'Oct 20, 2024',
      daysAgo: '5 days ago',
      score: 92,
      nextAction: 'Schedule Final Interview',
      skills: ['React', 'Node.js', 'TypeScript']
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      position: 'Data Scientist',
      department: 'Analytics',
      stage: 'Screening',
      appliedDate: 'Oct 22, 2024',
      daysAgo: '3 days ago',
      score: 88,
      nextAction: 'Phone Screening',
      skills: ['Python', 'ML', 'TensorFlow']
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      position: 'UI/UX Designer',
      department: 'Design',
      stage: 'Offer',
      appliedDate: 'Oct 15, 2024',
      daysAgo: '10 days ago',
      score: 95,
      nextAction: 'Awaiting Response',
      skills: ['Figma', 'Adobe XD', 'Prototyping']
    }
  ];

  return (
    <div className="organizer-panel">
      <div className="dashboard-background"></div>

      {/* Top Header */}
      <div className="organizer-header">
        <div className="header-left">
          <div className="logo-section">
            <img src="assets/img/logo/logo5.png" alt="ROAC Logo" className="dashboard-logo" />
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
                <span>{getUserInitials(authUser?.name || authUser?.fullName)}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="organizer-content">
        {/* Left Sidebar */}
        <div className={`organizer-sidebar ${sidebarExpanded ? 'expanded' : ''}`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
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
                <h2>Welcome Back, {authUser?.name || authUser?.fullName || 'Recruiter'} 👋</h2>
                <p>Here is the summary of overall performance <HelpCircle className="inline w-4 h-4" /></p>
              </div>
              <div className="welcome-actions">
                <button className="btn-host">
                  <Plus className="w-4 h-4" /> Host
                </button>
                <button className="btn-help">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color} enhanced-card`}>
                  <div className="stat-icon">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">{stat.value}</div>
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
                  <div className="chart-y-axis">
                    <span>$8k</span>
                    <span>$7k</span>
                    <span>$6k</span>
                    <span>$5k</span>
                    <span>$4k</span>
                    <span>$3k</span>
                    <span>$2k</span>
                    <span>0</span>
                  </div>
                  <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFD600" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FFD600" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lineGold" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFD600" />
                        <stop offset="50%" stopColor="#FFC107" />
                        <stop offset="100%" stopColor="#FFD600" />
                      </linearGradient>
                      <linearGradient id="lineOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#FF6B00" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="37.5" x2="800" y2="37.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="800" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="112.5" x2="800" y2="112.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="187.5" x2="800" y2="187.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="225" x2="800" y2="225" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="262.5" x2="800" y2="262.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Gold line with area */}
                    <path
                      d="M0,250 L66,240 L133,220 L200,210 L266,190 L333,180 L400,150 L466,140 L533,120 L600,100 L666,90 L733,80 L800,70 L800,300 L0,300 Z"
                      fill="url(#goldGradient)"
                    />
                    <path
                      d="M0,250 L66,240 L133,220 L200,210 L266,190 L333,180 L400,150 L466,140 L533,120 L600,100 L666,90 L733,80 L800,70"
                      stroke="url(#lineGold)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Orange line with area */}
                    <path
                      d="M0,270 L66,260 L133,250 L200,240 L266,230 L333,210 L400,190 L466,180 L533,170 L600,160 L666,150 L733,140 L800,130 L800,300 L0,300 Z"
                      fill="url(#orangeGradient)"
                    />
                    <path
                      d="M0,270 L66,260 L133,250 L200,240 L266,230 L333,210 L400,190 L466,180 L533,170 L600,160 L666,150 L733,140 L800,130"
                      stroke="url(#lineOrange)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    <circle cx="400" cy="150" r="5" fill="#FFD600" stroke="#1a1a1a" strokeWidth="2" />
                    <circle cx="400" cy="190" r="5" fill="#F59E0B" stroke="#1a1a1a" strokeWidth="2" />

                    {/* Month labels */}
                    <text x="0" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Jan</text>
                    <text x="66" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Feb</text>
                    <text x="133" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Mar</text>
                    <text x="200" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Apr</text>
                    <text x="266" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">May</text>
                    <text x="333" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Jun</text>
                    <text x="400" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Jul</text>
                    <text x="466" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Aug</text>
                    <text x="533" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Sep</text>
                    <text x="600" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Oct</text>
                    <text x="666" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Nov</text>
                    <text x="733" y="295" fill="rgba(255,255,255,0.5)" fontSize="12">Dec</text>
                  </svg>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot gold"></div>
                    <span>Applications Received</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot orange"></div>
                    <span>Interviews Conducted</span>
                  </div>
                </div>
              </div>

              {/* Activity Calendar */}
              <div className="activity-calendar-section">
                <div className="calendar-header">
                  <h3>Activity Report</h3>
                  <p>Real-time employee attendance report</p>
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
                  <select className="filter-select modern">
                    <option>All Stages</option>
                    <option>Interview</option>
                    <option>Screening</option>
                    <option>Offer</option>
                  </select>
                  <button className="export-btn modern">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              </div>

              <div className="candidates-table modern">
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
                    {candidates.map((candidate, index) => (
                      <tr key={index} className="candidate-row">
                        <td>
                          <div className="candidate-info">
                            <div className="candidate-avatar">
                              <span>{candidate.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div className="candidate-details">
                              <div className="candidate-name">{candidate.name}</div>
                              <div className="candidate-email">{candidate.email}</div>
                              <div className="candidate-skills">
                                {candidate.skills.map((skill, idx) => (
                                  <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="position-info">
                            <div className="position-title">{candidate.position}</div>
                            <div className="position-department">{candidate.department}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`stage-badge ${candidate.stage.toLowerCase()}`}>
                            {candidate.stage}
                          </span>
                        </td>
                        <td>
                          <div className="date-info">
                            <div>{candidate.appliedDate}</div>
                            <div className="time-ago">{candidate.daysAgo}</div>
                          </div>
                        </td>
                        <td>
                          <div className="score-display">
                            <div className="score-number">{candidate.score}</div>
                            <div className="score-bar">
                              <div className="score-fill" style={{ width: `${candidate.score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="next-action">
                            {candidate.stage === 'Interview' ? <Calendar className="w-4 h-4" /> :
                              candidate.stage === 'Screening' ? <Phone className="w-4 h-4" /> :
                                <UserCheck className="w-4 h-4" />}
                            {candidate.nextAction}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn view" title="View Profile">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="action-btn message" title="Send Message">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button className="action-btn more" title="More Options">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;