import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = ({ user, activeTab, setActiveTab, isRecruiter = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-top-header">
      <div className="container-fluid">
        <div className="header-content">
          {/* Logo Section */}
          <div className="dashboard-logo">
            <img src="/assets/img/logo/logo5.png" alt="ROAC" />
          </div>
          
          {/* Navigation Categories */}
          <nav className="dashboard-main-nav">
            {isRecruiter ? (
              // Recruiter Navigation
              <>
                <button 
                  className={`nav-category ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button 
                  className={`nav-category ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('performance')}
                >
                  <i className="fas fa-chart-line"></i> Performance
                </button>
                <button 
                  className={`nav-category ${activeTab === 'team' ? 'active' : ''}`}
                  onClick={() => setActiveTab('team')}
                >
                  <i className="fas fa-users"></i> Team
                </button>
                <button 
                  className={`nav-category ${activeTab === 'tracker' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tracker')}
                >
                  <i className="fas fa-tasks"></i> Tracker
                </button>
                <button 
                  className={`nav-category ${activeTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feedback')}
                >
                  <i className="fas fa-comments"></i> Feedback
                </button>
                <button 
                  className={`nav-category ${activeTab === 'report' ? 'active' : ''}`}
                  onClick={() => setActiveTab('report')}
                >
                  <i className="fas fa-file-alt"></i> Report
                </button>
                <button 
                  className={`nav-category ${activeTab === 'billing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('billing')}
                >
                  <i className="fas fa-credit-card"></i> Billing
                </button>
                <button 
                  className={`nav-category ${activeTab === 'invoices' ? 'active' : ''}`}
                  onClick={() => setActiveTab('invoices')}
                >
                  <i className="fas fa-receipt"></i> Invoices
                </button>
              </>
            ) : (
              // Candidate Navigation
              <>
                <button 
                  className={`nav-category ${activeTab === 'internships' ? 'active' : ''}`}
                  onClick={() => setActiveTab('internships')}
                >
                  Internships
                </button>
                <button 
                  className={`nav-category ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Jobs
                </button>
                <button 
                  className={`nav-category ${activeTab === 'competitions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('competitions')}
                >
                  Competitions
                </button>
                <button 
                  className={`nav-category ${activeTab === 'scholarships' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scholarships')}
                >
                  Scholarships
                </button>
                <button 
                  className={`nav-category ${activeTab === 'workshops' ? 'active' : ''}`}
                  onClick={() => setActiveTab('workshops')}
                >
                  Workshops
                </button>
                <button 
                  className={`nav-category ${activeTab === 'prime-hub' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prime-hub')}
                >
                  ROAC Prime Hub
                </button>
              </>
            )}
          </nav>

          {/* User Section - Right Side */}
          <div className="dashboard-user-section">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email || 'user@example.com'}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;