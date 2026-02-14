import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Search, Calendar, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import QuickListingForm from './QuickListingForm';
import UnifiedEditModal from './UnifiedEditModal/UnifiedEditModal';
import './ManageJobsTab.css'; // Reuse same CSS

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ManageEventsTab = ({ authUser, setEventsTabLoading, pendingModalType, onModalTypeHandled }) => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    
    // Listen for refresh events from QuickListingForm
    const handleRefresh = (event) => {
      if (event.detail.type === 'opportunity') {
        fetchEvents();
      }
    };
    
    window.addEventListener('refreshListings', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshListings', handleRefresh);
    };
  }, []);

  // Handle pending modal type from dashboard
  useEffect(() => {
    if (pendingModalType === 'event') {
      handleCreateEvent();
      if (onModalTypeHandled) {
        onModalTypeHandled();
      }
    }
  }, [pendingModalType]);

  const fetchEvents = async () => {
    try {
      setEventsTabLoading(true);
      const response = await fetch(`${API_URL}/events/my-events?showAll=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(`Failed to load events: ${error.message}`);
    } finally {
      setEventsTabLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowQuickForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchEvents();
    setShowEditModal(false);
    setEditingEvent(null);
    toast.success('Event updated successfully');
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
        setShowDeleteConfirm(null);
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = false;
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'draft') {
      matchesFilter = event.approvalStatus === 'draft';
    } else if (filterStatus === 'pending') {
      matchesFilter = event.approvalStatus === 'pending';
    } else if (filterStatus === 'approved') {
      matchesFilter = event.approvalStatus === 'approved';
    } else if (filterStatus === 'rejected') {
      matchesFilter = event.approvalStatus === 'rejected';
    } else {
      // For status filters like upcoming, completed, cancelled
      matchesFilter = event.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="manage-jobs-container">
      <div className="manage-jobs-header">
        <div>
          <h2>Manage Events</h2>
          <p>Create, edit, and manage all your recruitment events</p>
        </div>
        <div className="header-buttons">
          <button 
            className="btn-primary" 
            onClick={handleCreateEvent}
          >
            <Plus size={20} /> Create New Event
          </button>
        </div>
      </div>

      <div className="manage-jobs-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All ({events.length})
          </button>
          <button
            className={filterStatus === 'draft' ? 'active' : ''}
            onClick={() => setFilterStatus('draft')}
          >
            Drafts ({events.filter(e => e.approvalStatus === 'draft').length})
          </button>
          <button
            className={filterStatus === 'approved' ? 'active' : ''}
            onClick={() => setFilterStatus('approved')}
          >
            Approved ({events.filter(e => e.approvalStatus === 'approved').length})
          </button>
          <button
            className={filterStatus === 'pending' ? 'active' : ''}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({events.filter(e => e.approvalStatus === 'pending').length})
          </button>
          <button
            className={filterStatus === 'rejected' ? 'active' : ''}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected ({events.filter(e => e.approvalStatus === 'rejected').length})
          </button>
          <button
            className={filterStatus === 'upcoming' ? 'active' : ''}
            onClick={() => setFilterStatus('upcoming')}
          >
            Upcoming ({events.filter(e => e.status === 'upcoming').length})
          </button>
          <button
            className={filterStatus === 'completed' ? 'active' : ''}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({events.filter(e => e.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Attendees</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>
                    <div className="job-title-cell">
                      <div>
                        <div className="job-title">{event.title}</div>
                        {event.featured && <span className="badge-featured">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(event.startDate)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: '#FFD600' }} />
                      {event.location || 'Online'}
                    </div>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <Users size={16} />
                      {event.registrations || 0}
                    </div>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <Eye size={16} />
                      {event.views || 0}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className={`status-badge status-${event.approvalStatus || 'pending'}`}>
                        {event.approvalStatus || 'pending'}
                      </span>
                      {event.approvalStatus === 'approved' && (
                        <span className={`status-badge status-${event.status || 'upcoming'}`} style={{ fontSize: '0.75rem' }}>
                          {event.status || 'upcoming'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditEvent(event)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => setShowDeleteConfirm(event.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No events found</h3>
          <p>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first event to get started'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button 
              className="btn-primary" 
              onClick={handleCreateEvent}
            >
              <Plus size={20} /> Create First Event
            </button>
          )}
        </div>
      )}

      {/* Quick Listing Form for Create */}
      {showQuickForm && (
        <QuickListingForm
          isOpen={showQuickForm}
          onClose={() => setShowQuickForm(false)}
          contentType="opportunity"
          authUser={authUser}
        />
      )}

      {/* Unified Edit Modal */}
      {showEditModal && editingEvent && (
        <UnifiedEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
          }}
          contentType="opportunity"
          editData={editingEvent}
          authUser={authUser}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Event?</h3>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDeleteEvent(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEventsTab;
