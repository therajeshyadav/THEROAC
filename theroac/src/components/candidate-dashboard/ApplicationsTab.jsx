// src/components/candidate-dashboard/ApplicationsTab.jsx
import React, { useState, useMemo } from 'react';

const ApplicationsTab = ({ applications, getStatusColor, onViewJobDetails }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: applications.length,
      applied: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      accepted: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const status = app.status?.toLowerCase() || 'pending';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(app => 
        app.status?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const jobData = app.job || app.Job || {};
        return (
          jobData.title?.toLowerCase().includes(searchLower) ||
          jobData.companyName?.toLowerCase().includes(searchLower) ||
          jobData.company?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'company':
          const companyA = (a.job?.companyName || a.Job?.companyName || a.job?.company || '').toLowerCase();
          const companyB = (b.job?.companyName || b.Job?.companyName || b.job?.company || '').toLowerCase();
          return companyA.localeCompare(companyB);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, activeFilter, searchTerm, sortBy]);

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i className="fas fa-file-alt" style={{ marginRight: '8px', color: '#FFD600' }}></i>
            My Applications
          </h4>
          <div className="header-actions">
            <span className="application-count">
              {filteredApplications.length} of {applications.length} applications
            </span>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="application-filters">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search search-icon" />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company A-Z</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary w-100">
                <i className="fas fa-download" /> Export
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({statusCounts.all})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'applied' ? 'active' : ''}`}
              onClick={() => setActiveFilter('applied')}
            >
              Applied ({statusCounts.applied})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'reviewing' ? 'active' : ''}`}
              onClick={() => setActiveFilter('reviewing')}
            >
              Reviewing ({statusCounts.reviewing})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'shortlisted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('shortlisted')}
            >
              Shortlisted ({statusCounts.shortlisted})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'interview' ? 'active' : ''}`}
              onClick={() => setActiveFilter('interview')}
            >
              Interview ({statusCounts.interview})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected ({statusCounts.rejected})
            </button>
          </div>
        </div>

        <div className="applications-detailed">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => {
              const jobData = app.job || app.Job || null;

              const jobForUrl = jobData
                ? jobData.companyName
                  ? jobData
                  : { ...jobData, companyName: jobData.company || jobData.companyName }
                : null;

              return (
                <div key={app.id} className="application-detailed-item">
                  <div className="application-content">
                    <div className="application-main">
                      <h5>{jobData?.title || 'Job Title'}</h5>
                      <p className="company-name">
                        {jobData?.companyName || jobData?.company || 'Company Name'}
                      </p>
                      <div className="application-meta">
                        <span>
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="application-status">
                      <div className="status-section">
                        <span>
                          <i className="fas fa-calendar" /> Applied: {app.appliedDate}
                        </span>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(app.status) }}
                        >
                          {app.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="application-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          if (jobForUrl) {
                            onViewJobDetails(jobForUrl);
                          }
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-data">
              <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <h5>No Applications Found</h5>
              <p>
                {searchTerm || activeFilter !== 'all' 
                  ? 'No applications match your filters. Try adjusting your search.'
                  : 'You haven\'t applied to any jobs yet. Start exploring opportunities!'}
              </p>
              {(searchTerm || activeFilter !== 'all') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTab;
