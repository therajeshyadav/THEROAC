// src/components/admin/AdminDashboard/tabs/EventsTab.jsx
import { useState, useEffect } from "react";
import { Calendar, Search, Eye, Edit, Trash2 } from "lucide-react";
import apiService from "../../../services/api";
import { toast } from "react-toastify";
import "./EventsTab.css";

const EventsTab = ({ events: initialEvents }) => {
  const [events, setEvents] = useState(initialEvents || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(status && { status })
      };
      
      const response = await apiService.getAdminEvents(params);
      setEvents(response.events || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents(1, searchQuery, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return '#2196F3';
      case 'ongoing': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      await apiService.updateEventStatus(eventId, newStatus);
      toast.success(`Event status updated to ${newStatus}`);
      fetchEvents(currentPage, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteEventAdmin(eventId);
      toast.success('Event deleted successfully');
      fetchEvents(currentPage, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-enhanced-event-management">
        <div className="admin-event-management-header">
          <div className="admin-header-title">
            <h3>Event Management</h3>
            <p>Manage and monitor all platform events</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search-filter-container">
              <div className="admin-search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="admin-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="events-grid-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <Calendar className="w-16 h-16 mb-4" />
              <h4>No Events Found</h4>
              <p>No events match your current filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="events-table-container">
                <table className="admin-events-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Location</th>
                      <th>Organizer</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="event-row">
                        <td>
                          <div className="event-title-cell">
                            <h4 className="event-title">{event.title}</h4>
                            <p className="event-organizer">{event.organizer?.fullName || 'Unknown Organizer'}</p>
                          </div>
                        </td>
                        <td className="date-cell">
                          {new Date(event.startDate).toLocaleDateString()}
                        </td>
                        <td className="date-cell">
                          {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="location-cell">{event.location || 'Online'}</td>
                        <td className="organizer-cell">{event.organizer?.fullName || 'Unknown'}</td>
                        <td className="status-cell">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(event.status) }}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="event-actions">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => window.open(`/event-detail/events/${event.slug || event.id}`, '_blank')}
                              title="View Event"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <select 
                              className="status-select"
                              value={event.status}
                              onChange={(e) => handleStatusUpdate(event.id, e.target.value)}
                              title="Change Status"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteEvent(event.id)}
                              title="Delete Event"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="events-grid">
                {events.map((event) => (
                  <div key={`card-${event.id}`} className="enhanced-event-card">
                    <div className="event-card-header">
                      <div className="event-title-section">
                        <h4>{event.title}</h4>
                        <p className="event-organizer">{event.organizer?.fullName || 'Unknown Organizer'}</p>
                      </div>
                      <span 
                        className="enhanced-status-badge"
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="event-card-body">
                      <div className="event-details">
                        <div className="event-detail-item">
                          <span className="detail-label">Start Date</span>
                          <span className="detail-value">
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="event-detail-item">
                          <span className="detail-label">End Date</span>
                          <span className="detail-value">
                            {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="event-detail-item">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{event.location || 'Online'}</span>
                        </div>
                        <div className="event-detail-item">
                          <span className="detail-label">Organizer</span>
                          <span className="detail-value">{event.organizer?.fullName || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="event-card-footer">
                      <div className="event-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => window.open(`/event-detail/events/${event.slug || event.id}`, '_blank')}
                          title="View Event"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <select 
                          className="status-select"
                          value={event.status}
                          onChange={(e) => handleStatusUpdate(event.id, e.target.value)}
                          title="Change Status"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button 
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => fetchEvents(currentPage - 1, searchQuery, statusFilter)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => fetchEvents(currentPage + 1, searchQuery, statusFilter)}
            >
              Next
            </button>
          </div>
        )}

        <div className="event-stats-summary">
          <div className="stats-summary-card">
            <div className="summary-stat">
              <span className="summary-number">{events.filter(e => e.status === 'upcoming').length}</span>
              <span className="summary-label">Upcoming</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{events.filter(e => e.status === 'ongoing').length}</span>
              <span className="summary-label">Ongoing</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{events.filter(e => e.status === 'completed').length}</span>
              <span className="summary-label">Completed</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{events.length}</span>
              <span className="summary-label">Total Events</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsTab;
