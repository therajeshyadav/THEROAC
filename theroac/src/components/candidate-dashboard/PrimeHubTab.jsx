// src/components/candidate-dashboard/PrimeHubTab.jsx
import React from 'react';

const PrimeHubTab = ({
  hubContent,
  appliedItems,
  onApplyHubContent,
  onViewHubContentDetails,
  setActiveTab
}) => {
  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>ROAC Prime Talent Hub</h4>
          <div className="search-stats">
            <span>{hubContent.length || 0} opportunities available</span>
          </div>
        </div>
        <div className="hub-content-grid">
          {hubContent.length > 0 ? (
            hubContent.map((content) => (
              <div key={content.id} className="hub-content-card">
                <div className="hub-content-header">
                  <div className="company-logo">
                    <i className="fas fa-star" />
                  </div>
                  <div className="hub-content-basic-info">
                    <h5>{content.title}</h5>
                    <p className="company-name">
                      {content.company || content.organization || 'ROAC Prime'}
                    </p>
                  </div>
                  <button className="save-content-btn">
                    <i className="far fa-bookmark" />
                  </button>
                </div>

                <div className="hub-content-details-grid">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt" />
                    <span>{content.location || 'Remote'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-rupee-sign" />
                    <span>{content.stipend || 'Competitive'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock" />
                    <span>{content.duration || 'Flexible'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar" />
                    <span>{content.timing || content.type || 'Part-time'}</span>
                  </div>
                </div>

                <div className="hub-content-skills">
                  {content.skills &&
                    content.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                </div>

                <div className="hub-content-card-footer">
                  <span className="posted-time">
                    Posted{' '}
                    {new Date(content.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <div className="hub-content-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => onViewHubContentDetails(content)}
                    >
                      View Details
                    </button>
                    <button
                      className={`btn-apply ${
                        appliedItems.has(content.id) ? 'applied' : ''
                      }`}
                      onClick={() => onApplyHubContent(content.id)}
                      disabled={appliedItems.has(content.id)}
                      style={{
                        backgroundColor: appliedItems.has(content.id) ? '#28a745' : '',
                        borderColor: appliedItems.has(content.id) ? '#28a745' : '',
                        cursor: appliedItems.has(content.id) ? 'not-allowed' : 'pointer',
                        opacity: appliedItems.has(content.id) ? 0.7 : 1
                      }}
                    >
                      {appliedItems.has(content.id) ? (
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
            ))
          ) : (
            <div className="no-data">
              <div className="no-data-icon">
                <i className="fas fa-star" />
              </div>
              <h3>Welcome to ROAC Prime Talent Hub!</h3>
              <p>
                Exclusive opportunities and premium content coming soon. Stay tuned for
                amazing career opportunities!
              </p>
              <button className="btn-primary" onClick={() => setActiveTab('jobs')}>
                Explore Jobs Meanwhile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrimeHubTab;
