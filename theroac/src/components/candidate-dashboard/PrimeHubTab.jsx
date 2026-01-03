// src/components/candidate-dashboard/PrimeHubTab.jsx
import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';

const PrimeHubTab = ({
  hubContent,
  appliedItems,
  onApplyHubContent,
  onViewHubContentDetails,
  setActiveTab
}) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [bookmarkedContent, setBookmarkedContent] = useState(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Load bookmarked content
  useEffect(() => {
    loadBookmarkedContent();
  }, []);

  const loadBookmarkedContent = async () => {
    try {
      const response = await apiService.getMyBookmarks();
      const bookmarks = response.bookmarks || response || [];
      const contentIds = new Set(
        bookmarks
          .filter(b => b.itemType === 'jobs' || b.itemType === 'events' || b.itemType === 'internships')
          .map(b => b.itemId)
      );
      setBookmarkedContent(contentIds);
    } catch (error) {
      console.error('Failed to load bookmarked content:', error);
    }
  };

  const handleBookmarkContent = async (contentId, content) => {
    try {
      // Map hub content types to bookmark types
      let itemType = 'jobs'; // default
      if (content.contentType === 'internship') {
        itemType = 'internships';
      } else if (content.contentType === 'event') {
        itemType = 'events';
      }
      
      const wasBookmarked = bookmarkedContent.has(contentId);
      
      const response = await apiService.toggleBookmark(contentId, itemType);
      
      // Toggle the bookmark state based on previous state
      if (wasBookmarked) {
        // Was bookmarked, now removing
        setBookmarkedContent(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
        toast.info('Bookmark removed');
      } else {
        // Was not bookmarked, now adding
        setBookmarkedContent(prev => new Set([...prev, contentId]));
        toast.success('Content bookmarked!');
      }
    } catch (error) {
      console.error('Content bookmark error:', error);
      toast.error('Failed to bookmark content');
    }
  };

  // Filter content
  const filteredContent = hubContent.filter(content => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        content.title?.toLowerCase().includes(searchLower) ||
        content.description?.toLowerCase().includes(searchLower) ||
        content.company?.toLowerCase().includes(searchLower) ||
        (content.skills && content.skills.some(s => s.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const contentCategory = content.category || content.contentType || '';
      if (!contentCategory.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }

    // Location filter
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'remote') {
        if (!content.location?.toLowerCase().includes('remote') && content.locationType !== 'remote') {
          return false;
        }
      } else {
        if (!content.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }
    }

    // Type filter
    if (selectedType !== 'all') {
      const contentType = content.type || content.contentType || '';
      if (!contentType.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }
    }

    // Bookmarked only filter
    if (showBookmarkedOnly && !bookmarkedContent.has(content.id)) {
      return false;
    }

    return true;
  });

  // Sort content
  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      default:
        return 0;
    }
  });

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i className="fas fa-star" style={{ marginRight: '8px', color: '#FFD600' }}></i>
            Search ROAC Prime Content
          </h4>
          <div className="search-stats">
            <span>{sortedContent.length} of {hubContent.length} opportunities</span>
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
                    placeholder="Content title, company, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search search-icon" />
                </div>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="course">Course</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="project">Project</option>
                  <option value="career-tips">Career Tips</option>
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="exclusive">Exclusive</option>
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
                    <i className="fas fa-bookmark" /> Bookmarked Only ({bookmarkedContent.size})
                  </button>
                  {searchTerm && (
                    <button className="chip" onClick={() => setSearchTerm('')}>
                      {searchTerm} <i className="fas fa-times" />
                    </button>
                  )}
                  {selectedCategory !== 'all' && (
                    <button className="chip" onClick={() => setSelectedCategory('all')}>
                      {selectedCategory} <i className="fas fa-times" />
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

      {/* Content Listings */}
      <div className="dashboard-card">
        <div className="card-header">
          <h4>ROAC Prime Opportunities</h4>
          <span className="job-count">{sortedContent.length} found</span>
        </div>
        <div className="jobs-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem',
          width: '100%',
          minHeight: '200px'
        }}>
          {sortedContent.map((content) => {
            const companyName = content.company || content.organization || 'ROAC Prime';
            const displayLocation = content.location || 'Remote';
            
            // Format pricing based on content type with comma formatting
            let displayPrice = 'Free';
            let priceLabel = 'Access';
            
            // Helper function to format numbers with commas
            const formatNumber = (num) => {
              return num ? parseInt(num).toLocaleString() : '';
            };
            
            if (content.contentType === 'internship') {
              priceLabel = 'Stipend';
              if (content.stipend) {
                if (typeof content.stipend === 'object') {
                  const currency = content.stipend.currency === 'INR' ? '₹' : content.stipend.currency || '₹';
                  const period = content.stipend.period || 'month';
                  
                  if (content.stipend.min && content.stipend.max) {
                    const minFormatted = formatNumber(content.stipend.min);
                    const maxFormatted = formatNumber(content.stipend.max);
                    displayPrice = `${currency}${minFormatted} - ${currency}${maxFormatted}/${period}`;
                  } else if (content.stipend.min) {
                    const minFormatted = formatNumber(content.stipend.min);
                    displayPrice = `${currency}${minFormatted}+/${period}`;
                  } else if (content.stipend.amount) {
                    // Backward compatibility for old single amount format
                    const amountFormatted = formatNumber(content.stipend.amount);
                    displayPrice = `${currency}${amountFormatted}/${period}`;
                  } else {
                    displayPrice = 'Available';
                  }
                } else {
                  displayPrice = content.stipend;
                }
              } else {
                displayPrice = 'Available';
              }
            } else if (content.contentType === 'job') {
              priceLabel = 'Salary';
              if (content.salary) {
                if (typeof content.salary === 'object') {
                  const currency = content.salary.currency === 'INR' ? '₹' : content.salary.currency || '₹';
                  if (content.salary.min && content.salary.max) {
                    const minFormatted = formatNumber(content.salary.min);
                    const maxFormatted = formatNumber(content.salary.max);
                    displayPrice = `${currency}${minFormatted} - ${currency}${maxFormatted}`;
                  } else if (content.salary.min) {
                    const minFormatted = formatNumber(content.salary.min);
                    displayPrice = `${currency}${minFormatted}+`;
                  } else {
                    displayPrice = 'Competitive';
                  }
                } else {
                  displayPrice = content.salary;
                }
              } else {
                displayPrice = 'Competitive';
              }
            } else {
              // For courses, mentorship, etc.
              priceLabel = 'Fee';
              if (content.price) {
                const priceFormatted = formatNumber(content.price);
                displayPrice = `₹${priceFormatted}`;
              } else if (content.fee) {
                displayPrice = content.fee;
              }
            }
            
            const displayType = content.type || content.contentType || 'Opportunity';
            
            return (
              <div key={content.id} className="job-card-detailed" style={{
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
                    {content.featuredImage || content.thumbnailImage ? (
                      <img src={content.featuredImage || content.thumbnailImage} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="fas fa-star" />
                    )}
                  </div>
                  <div className="job-basic-info">
                    <h5>{content.title}</h5>
                    <p className="company-name">{companyName}</p>
                    <span className="badge" style={{ background: '#FFD600', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {displayType}
                    </span>
                  </div>
                  <button 
                    className="save-job-btn"
                    onClick={() => handleBookmarkContent(content.id, content)}
                    style={{ color: bookmarkedContent.has(content.id) ? '#FFD600' : '#666' }}
                  >
                    <i className={bookmarkedContent.has(content.id) ? "fas fa-bookmark" : "far fa-bookmark"} />
                  </button>
                </div>

                <div className="job-details-grid">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt" />
                    <span>{displayLocation}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-rupee-sign" />
                    <span><strong>{priceLabel}:</strong> {displayPrice}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock" />
                    <span>{content.duration || 'Flexible'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar" />
                    <span>{content.timing || 'Anytime'}</span>
                  </div>
                </div>

                {/* Skills section hidden as requested */}

                <div className="job-card-footer">
                  <span className="posted-time">
                    Posted {new Date(content.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <div className="job-actions">
                    <button className="btn-secondary" onClick={() => onViewHubContentDetails(content)}>
                      View Details
                    </button>
                    <button
                      className={`btn-apply ${appliedItems.has(content.id) ? 'applied' : ''}`}
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
            );
          })}
          {sortedContent.length === 0 && (
            <div className="no-data">
              <i className="fas fa-star" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <p>{showBookmarkedOnly ? 'No bookmarked content yet' : 'No content matches your filters'}</p>
              {(searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setSelectedType('all');
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

export default PrimeHubTab;
