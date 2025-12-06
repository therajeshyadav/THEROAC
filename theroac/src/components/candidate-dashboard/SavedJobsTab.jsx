import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';

const SavedJobsTab = ({ onViewJobDetails, onApplyJob, appliedItems }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [collections, setCollections] = useState(['default']);

  useEffect(() => {
    loadSavedJobs();
    loadCollections();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSavedJobs();
      setSavedJobs(response.savedJobs || []);
    } catch (error) {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await apiService.getCollections();
      setCollections(['all', ...(response.collections || ['default'])]);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleUnsave = async (jobId, jobType) => {
    try {
      await apiService.toggleSaveJob(jobId, jobType);
      setSavedJobs(prev => prev.filter(j => j.jobId !== jobId));
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  const filteredJobs = selectedCollection === 'all' 
    ? savedJobs 
    : savedJobs.filter(j => j.collection === selectedCollection);

  if (loading) {
    return (
      <div className="tab-content">
        <div className="dashboard-card">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>Saved Jobs</h4>
          <div className="collection-filter">
            <select 
              className="form-control"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
            >
              {collections.map(col => (
                <option key={col} value={col}>
                  {col === 'all' ? 'All Collections' : col}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-bookmark" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
            <h5>No Saved Jobs</h5>
            <p>Jobs you save will appear here for easy access</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((saved) => {
              const job = saved.jobDetails;
              if (!job) return null;

              const isInternship = saved.jobType === 'internship';
              const companyName = job.companyName || job.company;
              const displayLocation = job.location || 'Remote';

              return (
                <div key={saved.id} className="job-card-detailed">
                  <div className="job-card-header">
                    <div className="company-logo">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-building" />
                      )}
                    </div>
                    <div className="job-basic-info">
                      <h5>{job.title}</h5>
                      <p className="company-name">{companyName}</p>
                      {isInternship && (
                        <span className="badge" style={{ background: '#FFD600', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          Internship
                        </span>
                      )}
                    </div>
                    <button 
                      className="save-job-btn"
                      onClick={() => handleUnsave(job.id, saved.jobType)}
                      style={{ color: '#FFD600' }}
                    >
                      <i className="fas fa-bookmark" />
                    </button>
                  </div>

                  <div className="job-details-grid">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt" />
                      <span>{displayLocation}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar" />
                      <span>Saved {new Date(saved.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {saved.notes && (
                    <div className="job-notes">
                      <i className="fas fa-sticky-note" />
                      <span>{saved.notes}</span>
                    </div>
                  )}

                  <div className="job-card-footer">
                    <span className="collection-tag">
                      <i className="fas fa-folder" /> {saved.collection}
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
                        {appliedItems.has(job.id) ? '✓ Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsTab;
