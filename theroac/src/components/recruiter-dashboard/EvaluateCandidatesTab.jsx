import { useState, useEffect } from 'react';
import { Search, Eye, Award, Users, Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';
import './EvaluateCandidatesTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EvaluateCandidatesTab = ({ authUser }) => {
  const [events, setEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');

  useEffect(() => {
    fetchEvents();
    fetchEventParticipants();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events?perPage=100&page=1`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();

      const userEvents = data.filter(
        event => String(event.createdBy) === String(authUser?.id)
      );

      setEvents(userEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const fetchEventParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      setEventParticipants(data.participants || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load event participants');
      setEventParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return { label: 'Upcoming', color: '#FFA500' };
    if (now >= start && now <= end) return { label: 'Live', color: '#4CAF50' };
    return { label: 'Ended', color: '#757575' };
  };

  const getParticipantsCount = (eventId) =>
    eventParticipants.filter(p => p.eventId === eventId).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="evaluate-candidates-container">
      <div className="evaluate-header">
        <div>
          <h2>Evaluate Events</h2>
          <p>View and manage your event participants</p>
        </div>

        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Events</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Teams</span>
            <span className="stat-value">{eventParticipants.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="evaluate-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
          <option value="all">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="empty-state">
          <Award size={64} style={{ opacity: 0.3 }} />
          <h3>No events found</h3>
          <p>Your created events will appear here</p>
        </div>
      ) : (
        <div className="events-grid">
          {events
            .filter(event => {
              const matchesSearch =
                event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase());

              const matchesEvent =
                filterEvent === 'all' || event.id === filterEvent;

              return matchesSearch && matchesEvent;
            })
            .map(event => {
              const status = getEventStatus(event);
              const participants = getParticipantsCount(event.id);

              return (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <div>
                      <h3>{event.title}</h3>
                      <div className="event-metaEvaluate">
                        <Calendar size={14} />
                        {new Date(event.startDate).toLocaleDateString()}
                        <MapPin size={14} />
                        {event.location || event.locationType}
                      </div>
                    </div>
                    <span
                      className="event-status-badge"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="event-stats">
                    <Users size={16} />
                    {participants} Participants
                  </div>

                  <button
                    className="btn-view-participants"
                    onClick={() =>
                      window.open(
                        `/event-participants/${event.id}`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    disabled={participants === 0}
                  >
                    <Eye size={16} />
                    View Participants
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default EvaluateCandidatesTab;
