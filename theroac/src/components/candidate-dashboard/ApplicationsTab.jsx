// src/components/candidate-dashboard/ApplicationsTab.jsx
import React from 'react';

const ApplicationsTab = ({ applications, getStatusColor, onViewJobDetails }) => {
  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>My Applications</h4>
          <div className="filter-tabs">
            <button className="filter-tab active">All</button>
            <button className="filter-tab">Applied</button>
            <button className="filter-tab">Interview</button>
            <button className="filter-tab">Rejected</button>
          </div>
        </div>
        <div className="applications-detailed">
          {applications.length > 0 ? (
            applications.map((app) => {
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
              <p>No applications found. Start applying to jobs!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTab;
