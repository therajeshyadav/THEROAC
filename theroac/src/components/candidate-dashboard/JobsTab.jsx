// src/components/candidate-dashboard/JobsTab.jsx
import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';

const JobsTab = ({ jobs, internships = [], dashboardStats, appliedItems, onApplyJob, onViewJobDetails }) => {
  // Combine jobs and internships
  const allOpportunities = [...jobs, ...internships];
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [salaryRange, setSalaryRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Load bookmarked jobs
  useEffect(() => {
    loadBookmarkedJobs();
  }, []);

  const loadBookmarkedJobs = async () => {
    try {
      const response = await apiService.getMyBookmarks();
      const bookmarks = response.bookmarks || response || [];
      const jobIds = new Set(
        bookmarks
          .filter(b => b.itemType === 'jobs' || b.itemType === 'internships')
          .map(b => b.itemId)
      );
      setBookmarkedJobs(jobIds);
    } catch (error) {
      console.error('Failed to load bookmarked jobs:', error);
    }
  };

  const handleBookmarkJob = async (jobId, isInternship = false) => {
    try {
      const itemType = isInternship ? 'internships' : 'jobs';
      const wasBookmarked = bookmarkedJobs.has(jobId);
      
      const response = await apiService.toggleBookmark(jobId, itemType);
      console.log('Bookmark response:', response);
      
      // Toggle the bookmark state based on previous state
      if (wasBookmarked) {
        // Was bookmarked, now removing
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.info('Bookmark removed');
      } else {
        // Was not bookmarked, now adding
        setBookmarkedJobs(prev => new Set([...prev, jobId]));
        toast.success(`${isInternship ? 'Internship' : 'Job'} bookmarked!`);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to bookmark item');
    }
  };

  // Filter jobs
  const filteredJobs = allOpportunities.filter(job => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchLower) ||
        job.companyName?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        (job.skills && job.skills.some(s => s.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Location filter
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'remote') {
        if (job.locationType !== 'remote' && !job.location?.toLowerCase().includes('remote')) {
          return false;
        }
      } else {
        if (!job.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }
    }

    // Type filter
    if (selectedType !== 'all') {
      const isInternship = job.contentType === 'internship';
      if (selectedType === 'internship' && !isInternship) return false;
      if (selectedType === 'full-time' && (isInternship || job.jobType !== 'full-time')) return false;
      if (selectedType === 'part-time' && job.jobType !== 'part-time') return false;
      if (selectedType === 'contract' && job.jobType !== 'contract') return false;
    }

    // Experience filter
    if (selectedExperience !== 'all') {
      const exp = job.experienceLevel || job.experience || '';
      if (!exp.toLowerCase().includes(selectedExperience.toLowerCase())) {
        return false;
      }
    }

    // Bookmarked only filter
    if (showBookmarkedOnly && !bookmarkedJobs.has(job.id)) {
      return false;
    }

    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'company':
        return (a.companyName || a.company || '').localeCompare(b.companyName || b.company || '');
      default:
        return 0;
    }
  });
  
  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i className="fas fa-search" style={{ marginRight: '8px', color: '#FFD600' }}></i>
            Search Jobs & Internships
          </h4>
          <div className="search-stats">
            <span>{sortedJobs.length} of {allOpportunities.length} opportunities</span>
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
                    placeholder="Job title, company, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search search-icon" />
                </div>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="delhi">Delhi</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                >
                  <option value="all">All Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="company">Company A-Z</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="filter-chips">
                  <button 
                    className={`chip ${showBookmarkedOnly ? 'active' : ''}`}
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  >
                    <i className="fas fa-bookmark" /> Bookmarked Only ({bookmarkedJobs.size})
                  </button>
                  {searchTerm && (
                    <button className="chip" onClick={() => setSearchTerm('')}>
                      {searchTerm} <i className="fas fa-times" />
                    </button>
                  )}
                  {selectedType !== 'all' && (
                    <button className="chip" onClick={() => setSelectedType('all')}>
                      {selectedType} <i className="fas fa-times" />
                    </button>
                  )}
                  {selectedLocation !== 'all' && (
                    <button className="chip" onClick={() => setSelectedLocation('all')}>
                      {selectedLocation} <i className="fas fa-times" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="dashboard-card">
        <div className="card-header">
          <h4>Available Opportunities</h4>
          <span className="job-count">{sortedJobs.length} found</span>
        </div>
        <div className="jobs-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem',
          width: '100%',
          minHeight: '200px'
        }}>
          {sortedJobs.map((job) => {
            // Check if this is an internship (from hub_content) or regular job
            const isInternship = job.contentType === 'internship';
            const companyName = job.companyName || job.company;
            const displayLocation = job.location || 'Remote';
            
            // Format salary/stipend properly with labels and comma formatting
            let displaySalary = 'Competitive';
            let salaryLabel = 'Salary';
            
            // Helper function to format numbers with commas
            const formatNumber = (num) => {
              return num ? parseInt(num).toLocaleString() : '';
            };
            
            if (isInternship) {
              salaryLabel = 'Stipend';
              if (job.stipend) {
                if (typeof job.stipend === 'object') {
                  const currency = job.stipend.currency === 'INR' ? '₹' : job.stipend.currency || '₹';
                  const period = job.stipend.period || 'month';
                  
                  if (job.stipend.min && job.stipend.max) {
                    const minFormatted = formatNumber(job.stipend.min);
                    const maxFormatted = formatNumber(job.stipend.max);
                    displaySalary = `${currency}${minFormatted} - ${currency}${maxFormatted}/${period}`;
                  } else if (job.stipend.min) {
                    const minFormatted = formatNumber(job.stipend.min);
                    displaySalary = `${currency}${minFormatted}+/${period}`;
                  } else if (job.stipend.amount) {
                    // Backward compatibility for old single amount format
                    const amountFormatted = formatNumber(job.stipend.amount);
                    displaySalary = `${currency}${amountFormatted}/${period}`;
                  } else {
                    displaySalary = 'Available';
                  }
                } else if (typeof job.stipend === 'string') {
                  displaySalary = job.stipend;
                } else {
                  displaySalary = 'Available';
                }
              } else {
                displaySalary = 'Available';
              }
            } else {
              salaryLabel = 'Salary';
              if (job.salary) {
                if (typeof job.salary === 'object') {
                  const currency = job.salary.currency === 'INR' ? '₹' : job.salary.currency || '₹';
                  if (job.salary.min && job.salary.max) {
                    const minFormatted = formatNumber(job.salary.min);
                    const maxFormatted = formatNumber(job.salary.max);
                    displaySalary = `${currency}${minFormatted} - ${currency}${maxFormatted}`;
                  } else if (job.salary.min) {
                    const minFormatted = formatNumber(job.salary.min);
                    displaySalary = `${currency}${minFormatted}+`;
                  } else {
                    displaySalary = 'Competitive';
                  }
                } else {
                  displaySalary = job.salary;
                }
              }
            }
            
            const displayType = isInternship ? job.duration || 'Internship' : (job.jobType || 'Full-time');
            
            return (
              <div key={job.id} className="job-card-detailed" style={{
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                width: '100%',
                minHeight: '180px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
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
                    {isInternship && <span className="badge" style={{ background: '#FFD600', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Internship</span>}
                  </div>
                  <button 
                    className="save-job-btn"
                    onClick={() => handleBookmarkJob(job.id, isInternship)}
                    style={{ color: bookmarkedJobs.has(job.id) ? '#FFD600' : '#666' }}
                  >
                    <i className={bookmarkedJobs.has(job.id) ? "fas fa-bookmark" : "far fa-bookmark"} />
                  </button>
                </div>

                <div className="job-details-grid">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt" />
                    <span>{displayLocation}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-rupee-sign" />
                    <span><strong>{salaryLabel}:</strong> {displaySalary}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase" />
                    <span>{job.experience || job.experienceLevel || 'fresher'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar" />
                    <span>{displayType}</span>
                  </div>
                </div>

                {/* Skills section hidden as requested */}

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
            );
          })}
          {sortedJobs.length === 0 && (
            <div className="no-data">
              <i className="fas fa-briefcase" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <p>{showBookmarkedOnly ? 'No bookmarked jobs yet' : 'No jobs match your filters'}</p>
              {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedLocation('all');
                    setSelectedExperience('all');
                    setShowBookmarkedOnly(false);
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

export default JobsTab;
