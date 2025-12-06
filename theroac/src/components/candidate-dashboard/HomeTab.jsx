// src/components/candidate-dashboard/HomeTab.jsx
import React from 'react';

const HomeTab = ({
  quickStats,
  applications,
  events,
  jobs,
  dashboardStats,
  appliedItems,
  authUser,
  profileCompletion = 0,
  getStatusColor,
  onApplyJob,
  onViewJobDetails,
  onViewEventDetails,
  setActiveTab
}) => {
  return (
    <div className="tab-content">
      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <div className="profile-completion-banner mb-4">
          <div className="completion-content">
            <div className="completion-text">
              <h5>Complete Your Profile</h5>
              <p>A complete profile increases your chances of getting hired by {100 - profileCompletion}%</p>
            </div>
            <div className="completion-progress">
              <div className="progress-circle">
                <svg width="80" height="80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e0e0e0" strokeWidth="6" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="35" 
                    fill="none" 
                    stroke="#FFD600" 
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - profileCompletion / 100)}`}
                    transform="rotate(-90 40 40)"
                  />
                  <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#FFD600">
                    {profileCompletion}%
                  </text>
                </svg>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab && setActiveTab('profile')}
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="stats-grid mb-4">
        {quickStats.map((stat, index) => {
          // Determine which tab to navigate to based on stat title
          let targetTab = null;
          let filterStatus = null;
          
          if (stat.title === 'Applied Jobs') {
            targetTab = 'applications';
          } else if (stat.title === 'Available Jobs') {
            targetTab = 'jobs';
          } else if (stat.title === 'Upcoming Events') {
            targetTab = 'events';
          } else if (stat.title === 'Profile Views') {
            targetTab = 'profile';
          }

          return (
            <div 
              key={index} 
              className={`stat-card ${stat.color} enhanced-card ${targetTab ? 'clickable' : ''}`}
              onClick={() => targetTab && setActiveTab && setActiveTab(targetTab)}
              style={{ cursor: targetTab ? 'pointer' : 'default' }}
            >
              <div className="stat-icon-row">
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`} />
                </div>
                <div className="stat-number">{stat.value}</div>
              </div>
              <div className="stat-info">
                <div className="stat-label">
                  {stat.title}
                  {targetTab && (
                    <i className="fas fa-arrow-right" style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }} />
                  )}
                </div>
                {stat.details.map((detail, idx) => (
                  <div key={idx} className="stat-details">
                    <div>{detail.label}</div>
                    <div>{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Applications & Upcoming Events */}
      <div className="row">
        {/* Recent Applications */}
        <div className="col-lg-8 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Recent Applications</h4>
              <button 
                className="view-all"
                onClick={() => setActiveTab && setActiveTab('applications')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View All <i className="fas fa-arrow-right" style={{ marginLeft: '4px', fontSize: '12px' }} />
              </button>
            </div>
            <div className="applications-list">
              {applications.length > 0 ? (
                applications.slice(0, 3).map((app) => (
                  <div 
                    key={app.id} 
                    className="application-item clickable-item"
                    onClick={() => setActiveTab && setActiveTab('applications')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="application-info">
                      <h5>{app.job?.title || app.Job?.title || 'Job Title'}</h5>
                      <p>{app.job?.companyName || app.Job?.company || 'Company Name'}</p>
                      <span className="applied-date">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="application-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status || 'Pending'}
                      </span>
                      <i className="fas fa-chevron-right" style={{ marginLeft: '12px', color: '#999', fontSize: '14px' }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No applications yet. Start applying to jobs!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab && setActiveTab('jobs')}
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="col-lg-4 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Upcoming Events</h4>
              <button 
                className="view-all"
                onClick={() => setActiveTab && setActiveTab('events')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                View All <i className="fas fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
              </button>
            </div>
            <div className="events-list">
              {events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="event-item clickable-item"
                    onClick={() => onViewEventDetails(event)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="event-date">
                      <span className="date">
                        {new Date(event.date || event.startDate || Date.now()).getDate()}
                      </span>
                      <span className="month">
                        {new Date(event.date || event.startDate || Date.now()).toLocaleDateString(
                          'en',
                          { month: 'short' }
                        )}
                      </span>
                    </div>
                    <div className="event-info">
                      <h6>{event.title}</h6>
                      <p>{event.description}</p>
                      <span className="event-type">{event.type || 'Event'}</span>
                    </div>
                    <i className="fas fa-chevron-right" style={{ color: '#999', fontSize: '12px' }} />
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No upcoming events</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab && setActiveTab('events')}
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="row">
        <div className="col-12">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Recommended Jobs</h4>
              <a href="#" className="view-all">
                View All
              </a>
            </div>
            <div className="row">
              {jobs.length > 0 ? (
                jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="col-md-6 mb-3">
                    <div className="job-recommendation">
                      <div className="job-header">
                        <h5>{job.title}</h5>
                        <span className="match-percentage">New</span>
                      </div>
                      <p className="company">{job.company}</p>
                      <div className="job-details">
                        <span>
                          <i className="fas fa-map-marker-alt" /> {job.location || 'Remote'}
                        </span>
                        <span>
                          <i className="fas fa-rupee-sign" /> {
                            typeof job.salary === 'object' 
                              ? (job.salary.min && job.salary.max 
                                  ? `₹${job.salary.min} - ₹${job.salary.max}` 
                                  : job.salary.min 
                                    ? `₹${job.salary.min}+` 
                                    : 'Competitive')
                              : (job.salary || 'Competitive')
                          }
                        </span>
                      </div>
                      <div className="job-actions">
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => onViewJobDetails(job)}
                          style={{ marginRight: '8px' }}
                        >
                          View Details
                        </button>
                        <button
                          className={`btn-apply ${appliedItems.has(job.id) ? 'applied' : ''}`}
                          onClick={() => onApplyJob(job.id)}
                          disabled={appliedItems.has(job.id)}
                          style={{
                            backgroundColor: appliedItems.has(job.id) ? '#28a745' : '',
                            borderColor: appliedItems.has(job.id) ? '#28a745' : '',
                            cursor: appliedItems.has(job.id) ? 'not-allowed' : 'pointer',
                            opacity: appliedItems.has(job.id) ? 0.7 : 1
                          }}
                        >
                          {appliedItems.has(job.id) ? (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>✓</span>
                              Applied
                            </span>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                        <button className="btn-save">
                          <i className="fas fa-bookmark" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="no-data">
                    <p>No jobs available at the moment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
