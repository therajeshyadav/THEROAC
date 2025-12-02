// src/components/candidate-dashboard/EventsTab.jsx
import React from 'react';

const EventsTab = ({ events, appliedItems, onRegisterEvent, onViewEventDetails }) => {
  return (
    <div className="tab-content">
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Upcoming Events</h4>
            </div>
            <div className="events-detailed">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="event-detailed-item">
                    <div className="event-image">
                      <div className="event-placeholder">
                        <i className="fas fa-calendar-alt" />
                      </div>
                    </div>
                    <div className="event-content">
                      <h5>{event.title}</h5>
                      <p>
                        {event.description ||
                          'Join us for an exciting event to enhance your skills'}
                      </p>
                      <div className="event-meta">
                        <span>
                          <i className="fas fa-calendar" />{' '}
                          {new Date(event.date || event.startDate || Date.now()).toLocaleDateString()}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt" /> {event.location || 'Online'}
                        </span>
                        <span className="event-type-badge">{event.type || 'Event'}</span>
                      </div>
                      <div className="event-actions mt-2">
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => onViewEventDetails(event)}
                          style={{ marginRight: '8px' }}
                        >
                          View Details
                        </button>
                        <button
                          className={`btn-primary ${
                            appliedItems.has(event.id) ? 'registered' : ''
                          }`}
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
                ))
              ) : (
                <div className="no-data">
                  <p>No events available at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories side card */}
        <div className="col-lg-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h4>Event Categories</h4>
            </div>
            <div className="event-categories">
              <div className="category-item">
                <i className="fas fa-laptop-code" />
                <span>Workshops</span>
              </div>
              <div className="category-item">
                <i className="fas fa-users" />
                <span>Networking</span>
              </div>
              <div className="category-item">
                <i className="fas fa-trophy" />
                <span>Competitions</span>
              </div>
              <div className="category-item">
                <i className="fas fa-microphone" />
                <span>Conferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTab;
