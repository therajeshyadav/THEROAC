// src/components/candidate-dashboard/EventsTab.jsx
import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';

const EventsTab = ({ events, appliedItems, onRegisterEvent, onViewEventDetails }) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set());

  // Load bookmarked events
  useEffect(() => {
    loadBookmarkedEvents();
  }, []);

  const loadBookmarkedEvents = async () => {
    try {
      const response = await apiService.getMyBookmarks();
      const bookmarks = response.bookmarks || response || [];
      const eventIds = new Set(
        bookmarks
          .filter(b => b.itemType === 'events')
          .map(b => b.itemId)
      );
      setBookmarkedEvents(eventIds);
    } catch (error) {
      console.error('Failed to load bookmarked events:', error);
    }
  };

  const handleBookmarkEvent = async (eventId) => {
    try {
      const wasBookmarked = bookmarkedEvents.has(eventId);
      
      const response = await apiService.toggleBookmark(eventId, 'events');
      
      // Toggle the bookmark state based on previous state
      if (wasBookmarked) {
        // Was bookmarked, now removing
        setBookmarkedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.info('Bookmark removed');
      } else {
        // Was not bookmarked, now adding
        setBookmarkedEvents(prev => new Set([...prev, eventId]));
        toast.success('Event bookmarked!');
      }
    } catch (error) {
      console.error('Event bookmark error:', error);
      toast.error('Failed to bookmark event');
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.organizer?.toLowerCase().includes(searchLower) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const eventCategory = event.category || event.type || '';
      if (!eventCategory.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }

    // Location filter
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'online') {
        if (!event.location?.toLowerCase().includes('online') && event.locationType !== 'online') {
          return false;
        }
      } else {
        if (!event.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }
    }

    // Type filter
    if (selectedType !== 'all') {
      const eventType = event.type || event.category || '';
      if (!eventType.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      case 'oldest':
        return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(a.date || a.startDate) - new Date(b.date || b.startDate);
      default:
        return 0;
    }
  });

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i className="fas fa-calendar-alt" style={{ marginRight: '8px', color: '#FFD600' }}></i>
            Search Events
          </h4>
          <div className="search-stats">
            <span>{sortedEvents.length} of {events.length} events</span>
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
                    placeholder="Event title, organizer, description..."
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
                  <option value="workshop">Workshop</option>
                  <option value="networking">Networking</option>
                  <option value="competition">Competition</option>
                  <option value="conference">Conference</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="hackathon">Hackathon</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select 
                  className="form-control"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="online">Online</option>
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
                  <option value="paid">Paid</option>
                  <option value="premium">Premium</option>
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
                  <option value="date">Event Date</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="filter-chips">
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

      {/* Event Listings */}
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            Available {selectedCategory === 'all' ? 'Events' : 
              selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + 's'}
          </h4>
          <span className="job-count">{sortedEvents.length} found</span>
        </div>
        <div className="jobs-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem',
          width: '100%',
          minHeight: '200px'
        }}>
          {sortedEvents.map((event) => {
            const displayLocation = event.location || 'Online';
            const eventDate = new Date(event.date || event.startDate || Date.now());
            
            // Format registration fee properly (similar to jobs/internships)
            let displayPrice = 'Free';
            let priceLabel = 'Registration';
            
            // Helper function to format numbers with commas
            const formatNumber = (num) => {
              if (!num) return '0';
              return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            };
            
            if (event.registrationFee) {
              if (typeof event.registrationFee === 'object') {
                if (event.registrationFee.type === 'free' || event.registrationFee.amount === 0) {
                  displayPrice = 'Free';
                } else if (event.registrationFee.amount) {
                  const currency = event.registrationFee.currency === 'INR' ? '₹' : 
                                 event.registrationFee.currency === 'USD' ? '$' : 
                                 event.registrationFee.currency || '₹';
                  const formattedAmount = formatNumber(event.registrationFee.amount);
                  displayPrice = `${currency}${formattedAmount}`;
                }
              } else if (typeof event.registrationFee === 'string') {
                if (event.registrationFee.toLowerCase() === 'free' || event.registrationFee === '0') {
                  displayPrice = 'Free';
                } else if (event.registrationFee.toLowerCase().includes('usd')) {
                  // Handle "USDamount" format - extract numeric value and add $ symbol
                  const amount = event.registrationFee.replace(/[^\d.]/g, '');
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(Math.floor(parseFloat(amount)));
                    displayPrice = `$${formattedAmount}`;
                  } else {
                    displayPrice = event.registrationFee;
                  }
                } else if (event.registrationFee.toLowerCase().includes('inr')) {
                  // Handle "INRamount" format
                  const amount = event.registrationFee.replace(/[^\d.]/g, '');
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(Math.floor(parseFloat(amount)));
                    displayPrice = `₹${formattedAmount}`;
                  } else {
                    displayPrice = event.registrationFee;
                  }
                } else if (!isNaN(event.registrationFee)) {
                  // Pure numeric string
                  const formattedAmount = formatNumber(Math.floor(parseFloat(event.registrationFee)));
                  displayPrice = `₹${formattedAmount}`;
                } else {
                  displayPrice = event.registrationFee;
                }
              } else if (typeof event.registrationFee === 'number') {
                if (event.registrationFee === 0) {
                  displayPrice = 'Free';
                } else {
                  const formattedAmount = formatNumber(event.registrationFee);
                  displayPrice = `₹${formattedAmount}`;
                }
              }
            } else if (event.price) {
              if (typeof event.price === 'number') {
                if (event.price === 0) {
                  displayPrice = 'Free';
                } else {
                  const formattedAmount = formatNumber(event.price);
                  displayPrice = `₹${formattedAmount}`;
                }
              } else if (typeof event.price === 'string') {
                if (event.price.toLowerCase() === 'free' || event.price === '0') {
                  displayPrice = 'Free';
                } else if (event.price.toLowerCase().includes('usd')) {
                  const amount = event.price.replace(/[^\d.]/g, '');
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(Math.floor(parseFloat(amount)));
                    displayPrice = `$${formattedAmount}`;
                  } else {
                    displayPrice = event.price;
                  }
                } else if (event.price.toLowerCase().includes('inr')) {
                  const amount = event.price.replace(/[^\d.]/g, '');
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(Math.floor(parseFloat(amount)));
                    displayPrice = `₹${formattedAmount}`;
                  } else {
                    displayPrice = event.price;
                  }
                } else if (!isNaN(event.price)) {
                  const formattedAmount = formatNumber(Math.floor(parseFloat(event.price)));
                  displayPrice = `₹${formattedAmount}`;
                } else {
                  displayPrice = event.price;
                }
              } else {
                displayPrice = event.price;
              }
            }
            
            const displayType = event.type || event.category || event.eventType || 'Workshop';
            
            return (
              <div key={event.id} className="job-card-detailed" style={{
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
                    {event.featuredImage || event.image ? (
                      <img src={event.featuredImage || event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="fas fa-calendar-alt" />
                    )}
                  </div>
                  <div className="job-basic-info">
                    <h5>{event.title}</h5>
                    <p className="company-name">{event.organizer || 'Event Organizer'}</p>
                    <span className="badge" style={{ background: '#FFD600', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {displayType}
                    </span>
                  </div>
                  <button 
                    className="save-job-btn"
                    onClick={() => handleBookmarkEvent(event.id)}
                    style={{ color: bookmarkedEvents.has(event.id) ? '#FFD600' : '#666' }}
                  >
                    <i className={bookmarkedEvents.has(event.id) ? "fas fa-bookmark" : "far fa-bookmark"} />
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
                    <i className="fas fa-calendar" />
                    <span>{eventDate.toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock" />
                    <span>{event.duration || '2 hours'}</span>
                  </div>
                </div>

                <div className="job-card-footer">
                  <span className="posted-time">
                    Posted {new Date(event.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <div className="job-actions">
                    <button className="btn-secondary" onClick={() => onViewEventDetails(event)}>
                      View Details
                    </button>
                    <button
                      className={`btn-apply ${appliedItems.has(event.id) ? 'applied' : ''}`}
                      onClick={() => onRegisterEvent(event.id)}
                      disabled={appliedItems.has(event.id)}
                      style={{
                        backgroundColor: appliedItems.has(event.id) ? '#28a745' : '',
                        borderColor: appliedItems.has(event.id) ? '#28a745' : '',
                        cursor: appliedItems.has(event.id) ? 'not-allowed' : 'pointer',
                        opacity: appliedItems.has(event.id) ? 0.7 : 1
                      }}
                    >
                      {appliedItems.has(event.id) ? (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>✓</span>
                          Registered
                        </span>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedEvents.length === 0 && (
            <div className="no-data">
              <i className="fas fa-calendar-alt" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <p>No events match your filters</p>
              {(searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setSelectedType('all');
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

export default EventsTab;