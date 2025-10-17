import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import './Dashboard.css';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Check if user is logged in as recruiter
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser({
      ...parsedUser,
      userType: 'recruiter',
      companyName: 'ROAC Technologies',
      totalEmployees: 642921,
      requiredEmployees: 121866,
      onlineEmployees: 361715,
      remoteWork: 235817
    });
  }, [navigate]);

  // Employee stats data
  const employeeStats = [
    {
      title: 'Total Employees',
      count: '642,921',
      change: '+3% from previous period',
      changeType: 'positive',
      icon: 'fa-users',
      color: '#4CAF50'
    },
    {
      title: 'Required Employees',
      count: '121,866',
      change: '+8% from previous period',
      changeType: 'positive',
      icon: 'fa-user-plus',
      color: '#2196F3'
    },
    {
      title: 'Online Employees',
      count: '361,715',
      change: '-2% from previous period',
      changeType: 'negative',
      icon: 'fa-circle',
      color: '#FF9800'
    },
    {
      title: 'Remote Work',
      count: '235,817',
      change: '+15% from previous period',
      changeType: 'positive',
      icon: 'fa-home',
      color: '#9C27B0'
    }
  ];

  // Recent candidates data
  const recentCandidates = [
    {
      id: 'EMRA20024',
      name: 'Rajesh Majumdar',
      email: 'rajesh@example.com',
      department: 'Client & Team work',
      role: 'UI/UX Designer',
      totalSalary: '₹ 8,50,000',
      reimbursement: '₹ 6,50,000',
      status: 'Presence',
      avatar: null
    },
    {
      id: 'EMRA20025',
      name: 'Sosy Gulang Andika',
      email: 'sosy@example.com',
      department: 'Team Projects',
      role: 'Product Designer',
      totalSalary: '₹ 7,50,000',
      reimbursement: '₹ 7,50,000',
      status: 'Presence',
      avatar: null
    },
    {
      id: 'EMRA20026',
      name: 'Sinta Winda Purnama',
      email: 'sinta@example.com',
      department: 'Head of Projects',
      role: 'UI/UX Designer',
      totalSalary: '₹ 5,50,000',
      reimbursement: '₹ 5,50,000',
      status: 'Presence',
      avatar: null
    }
  ];

  // Job postings data
  const jobPostings = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      applications: 45,
      status: 'Active',
      postedDate: '2024-01-15',
      deadline: '2024-02-15'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      applications: 32,
      status: 'Active',
      postedDate: '2024-01-12',
      deadline: '2024-02-12'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      applications: 28,
      status: 'Closed',
      postedDate: '2024-01-10',
      deadline: '2024-02-10'
    }
  ];

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-background"></div>
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading recruiter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container recruiter-dashboard">
      <div className="dashboard-background"></div>

      {/* Recruiter Dashboard Header */}
      <DashboardHeader 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isRecruiter={true}
      />

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

      {/* Welcome Section */}
      <div className="recruiter-welcome-section">
        <div className="container">
          <div className="welcome-content">
            <div className="welcome-text">
              <h2>Welcome Back, {user?.name || 'Recruiter'} 👋</h2>
              <p>Here is the summary of overall performance</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary">
                <i className="fas fa-plus"></i> Add missing details
              </button>
              <button className="btn-secondary">
                <i className="fas fa-upload"></i> Host
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div className="container">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              {/* Employee Stats Cards */}
              <div className="row mb-4">
                {employeeStats.map((stat, index) => (
                  <div key={index} className="col-lg-3 col-md-6 mb-3">
                    <div className="recruiter-stat-card">
                      <div className="stat-header">
                        <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                          <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <div className="stat-info">
                          <h3>{stat.count}</h3>
                          <p>{stat.title}</p>
                        </div>
                      </div>
                      <div className={`stat-change ${stat.changeType}`}>
                        <i className={`fas ${stat.changeType === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        <span>{stat.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                {/* Payroll Cost Overview */}
                <div className="col-lg-8 mb-4">
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h4>Payroll Cost Overview</h4>
                      <div className="chart-filters">
                        <button className="filter-btn active">Today</button>
                        <button className="filter-btn">Last Week</button>
                        <button className="filter-btn">Last Month</button>
                        <button className="filter-btn">Year</button>
                      </div>
                    </div>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <div className="chart-lines">
                          <svg width="100%" height="300" viewBox="0 0 600 300">
                            <defs>
                              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF5000" />
                                <stop offset="100%" stopColor="#FF00B8" />
                              </linearGradient>
                              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00D4FF" />
                                <stop offset="100%" stopColor="#5200FF" />
                              </linearGradient>
                            </defs>
                            <path d="M50,250 Q150,200 250,180 T450,160 T550,140" 
                                  stroke="url(#gradient1)" 
                                  strokeWidth="3" 
                                  fill="none" />
                            <path d="M50,200 Q150,150 250,130 T450,110 T550,90" 
                                  stroke="url(#gradient2)" 
                                  strokeWidth="3" 
                                  fill="none" />
                          </svg>
                        </div>
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color" style={{backgroundColor: '#FF5000'}}></span>
                            <span>Current Period</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color" style={{backgroundColor: '#00D4FF'}}></span>
                            <span>Previous Period</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Report */}
                <div className="col-lg-4 mb-4">
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h4>Attendance Report</h4>
                      <p className="card-subtitle">This shows employees attendance report</p>
                    </div>
                    <div className="attendance-calendar">
                      <div className="calendar-grid">
                        {Array.from({length: 35}, (_, i) => (
                          <div key={i} className={`calendar-day ${i % 7 === 0 || i % 7 === 6 ? 'weekend' : ''} ${Math.random() > 0.7 ? 'present' : Math.random() > 0.5 ? 'absent' : 'partial'}`}>
                            {i < 31 ? i + 1 : ''}
                          </div>
                        ))}
                      </div>
                      <div className="calendar-legend">
                        <div className="legend-item">
                          <span className="legend-dot present"></span>
                          <span>Present</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot absent"></span>
                          <span>Absent</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot partial"></span>
                          <span>Partial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* List Employees */}
              <div className="row">
                <div className="col-12">
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h4>List Employees</h4>
                      <div className="table-actions">
                        <div className="search-box">
                          <i className="fas fa-search"></i>
                          <input type="text" placeholder="Search" />
                        </div>
                        <select className="filter-select">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                        <select className="filter-select">
                          <option>All Role</option>
                          <option>Developer</option>
                          <option>Designer</option>
                          <option>Manager</option>
                        </select>
                        <button className="btn-export">
                          <i className="fas fa-download"></i> Export
                        </button>
                      </div>
                    </div>
                    <div className="employees-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Payroll ID</th>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Total Salary</th>
                            <th>Reimbursement</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentCandidates.map((candidate, index) => (
                            <tr key={index}>
                              <td>{candidate.id}</td>
                              <td>
                                <div className="employee-info">
                                  <div className="employee-avatar">
                                    <i className="fas fa-user"></i>
                                  </div>
                                  <div className="employee-details">
                                    <span className="employee-name">{candidate.name}</span>
                                    <span className="employee-email">{candidate.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="department-tag">{candidate.department}</span>
                              </td>
                              <td>{candidate.role}</td>
                              <td>{candidate.totalSalary}</td>
                              <td>{candidate.reimbursement}</td>
                              <td>
                                <span className="status-badge active">{candidate.status}</span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="action-btn">
                                    <i className="fas fa-ellipsis-h"></i>
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
          )}

          {/* Other tabs content */}
          {activeTab !== 'dashboard' && (
            <div className="tab-content">
              <div className="dashboard-card">
                <div className="coming-soon-section">
                  <div className="coming-soon-icon">
                    <i className="fas fa-tools"></i>
                  </div>
                  <h3>Coming Soon!</h3>
                  <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development.</p>
                  <button className="btn-primary" onClick={() => setActiveTab('dashboard')}>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;