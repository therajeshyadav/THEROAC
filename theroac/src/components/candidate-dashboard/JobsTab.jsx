// src/components/candidate-dashboard/JobsTab.jsx
import React from 'react';

const JobsTab = ({ jobs, dashboardStats, appliedItems, onApplyJob, onViewJobDetails }) => {
  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>Find Jobs</h4>
          <div className="search-stats">
            <span>{dashboardStats.availableJobs || 0} jobs available</span>
          </div>
        </div>
        <div className="job-search-section">
          <div className="search-filters">
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Job title, keywords..."
                  />
                  <i className="fas fa-search search-icon" />
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <select className="form-control">
                  <option>All Categories</option>
                  <option>Software Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <select className="form-control">
                  <option>All Locations</option>
                  <option>Remote</option>
                  <option>Delhi</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <button className="btn btn-primary w-100">
                  <i className="fas fa-search" /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="dashboard-card">
        <div className="card-header">
          <h4>Available Jobs</h4>
          <span className="job-count">{jobs.length || 0} jobs found</span>
        </div>
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card-detailed">
              <div className="job-card-header">
                <div className="company-logo">
                  <i className="fas fa-building" />
                </div>
                <div className="job-basic-info">
                  <h5>{job.title}</h5>
                  <p className="company-name">{job.company}</p>
                </div>
                <button className="save-job-btn">
                  <i className="far fa-bookmark" />
                </button>
              </div>

              <div className="job-details-grid">
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt" />
                  <span>{job.location || 'Remote'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-rupee-sign" />
                  <span>{job.salary || 'Competitive'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-briefcase" />
                  <span>{job.experience || 'All levels'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-calendar" />
                  <span>{job.type || 'Full-time'}</span>
                </div>
              </div>

              <div className="job-skills">
                {job.requirements &&
                  job.requirements
                    .split(',')
                    .slice(0, 3)
                    .map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.trim()}
                      </span>
                    ))}
              </div>

              <div className="job-card-footer">
                <span className="posted-time">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <div className="job-actions">
                  <button className="btn-secondary" onClick={() => onViewJobDetails(job)}>
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
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="no-data">
              <p>No jobs available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsTab;
