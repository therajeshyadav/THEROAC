import React, { useState, useEffect } from 'react';
import { XCircle, RefreshCw, Eye, Calendar, Briefcase, User, MessageSquare, AlertTriangle } from 'lucide-react';
import apiService from '../../../services/api';
import { toast } from 'react-toastify';
import './RejectedItemsTab.css';

const RejectedItemsTab = () => {
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [rejectedInternships, setRejectedInternships] = useState([]);
  const [rejectedROACPrime, setRejectedROACPrime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRejectedItems();
  }, []);

  const fetchRejectedItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/admin/rejected-items');
      
      setRejectedJobs(Array.isArray(response.rejectedJobs) ? response.rejectedJobs : []);
      setRejectedEvents(Array.isArray(response.rejectedEvents) ? response.rejectedEvents : []);
      setRejectedInternships(Array.isArray(response.rejectedInternships) ? response.rejectedInternships : []);
      setRejectedROACPrime(Array.isArray(response.rejectedROACPrime) ? response.rejectedROACPrime : []);
    } catch (error) {
      console.error('Error fetching rejected items:', error);
      toast.error('Failed to load rejected items');
      setRejectedJobs([]);
      setRejectedEvents([]);
      setRejectedInternships([]);
      setRejectedROACPrime([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllowResubmission = async (type, id) => {
    try {
      await apiService.request(`/admin/rejected-items/${type}/${id}/allow-resubmission`, {
        method: 'PUT',
        body: JSON.stringify({ clearRejectionReason: true })
      });
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} has been reset for resubmission`);
      fetchRejectedItems();
    } catch (error) {
      console.error('Error allowing resubmission:', error);
      toast.error(`Failed to allow resubmission for ${type}`);
    }
  };

  const openDetailsModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderRejectedCard = (item, type) => {
    if (!item || !item.id) return null;

    const getIcon = () => {
      switch (type) {
        case 'job': return <Briefcase className="w-5 h-5" />;
        case 'event': return <Calendar className="w-5 h-5" />;
        case 'internship': return <User className="w-5 h-5" />;
        case 'roac-prime': return <MessageSquare className="w-5 h-5" />;
        default: return <XCircle className="w-5 h-5" />;
      }
    };

    const getCreatorName = () => {
      return item.recruiter?.fullName || item.organizer?.fullName || item.author?.fullName || 'Unknown';
    };

    const getCompanyName = () => {
      return item.companyName || item.location || 'Not specified';
    };

    return (
      <div key={item.id} className="rejected-card">
        <div className="rejected-card-header">
          <div className="rejected-info">
            <div className="rejected-icon">
              {getIcon()}
            </div>
            <div>
              <h4 className="rejected-title">{item.title}</h4>
              <p className="rejected-company">{getCompanyName()}</p>
              <p className="rejected-meta">
                Created by: {getCreatorName()} • Rejected: {formatDate(item.approvedAt)}
              </p>
            </div>
          </div>
          <div className="rejected-status">
            <span className="status-badge rejected">
              <XCircle className="w-3 h-3" />
              Rejected
            </span>
          </div>
        </div>

        <div className="rejection-reason">
          <div className="reason-header">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="reason-label">Rejection Reason:</span>
          </div>
          <p className="reason-text">{item.rejectionReason || 'No reason provided'}</p>
        </div>

        <div className="rejected-actions">
          <button 
            className="action-btn view-btn"
            onClick={() => openDetailsModal(item, type)}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button 
            className="action-btn resubmit-btn"
            onClick={() => handleAllowResubmission(type, item.id)}
          >
            <RefreshCw className="w-4 h-4" />
            Allow Resubmission
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading rejected items...</p>
      </div>
    );
  }

  return (
    <section className="admin-tab-content">
      <div className="rejected-items-header">
        <div>
          <h2>Rejected Items</h2>
          <p>Manage rejected jobs, events, internships, and ROAC Prime content</p>
        </div>
        <div className="rejection-stats">
          <div className="stat-item">
            <span className="stat-value">{rejectedJobs.length}</span>
            <span className="stat-label">Rejected Jobs</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{rejectedEvents.length}</span>
            <span className="stat-label">Rejected Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{rejectedInternships.length}</span>
            <span className="stat-label">Rejected Internships</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{rejectedROACPrime.length}</span>
            <span className="stat-label">Rejected ROAC Prime</span>
          </div>
        </div>
      </div>

      <div className="rejection-tabs">
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase className="w-4 h-4" />
          Jobs ({rejectedJobs.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar className="w-4 h-4" />
          Events ({rejectedEvents.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'internships' ? 'active' : ''}`}
          onClick={() => setActiveTab('internships')}
        >
          <User className="w-4 h-4" />
          Internships ({rejectedInternships.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roac-prime' ? 'active' : ''}`}
          onClick={() => setActiveTab('roac-prime')}
        >
          <MessageSquare className="w-4 h-4" />
          ROAC Prime ({rejectedROACPrime.length})
        </button>
      </div>

      <div className="rejection-content">
        {activeTab === 'jobs' && (
          <div className="rejected-grid">
            {rejectedJobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase className="w-16 h-16 mb-4" />
                <h3>No Rejected Jobs</h3>
                <p>All jobs are either approved or pending</p>
              </div>
            ) : (
              rejectedJobs.map(job => renderRejectedCard(job, 'job'))
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="rejected-grid">
            {rejectedEvents.length === 0 ? (
              <div className="empty-state">
                <Calendar className="w-16 h-16 mb-4" />
                <h3>No Rejected Events</h3>
                <p>All events are either approved or pending</p>
              </div>
            ) : (
              rejectedEvents.map(event => renderRejectedCard(event, 'event'))
            )}
          </div>
        )}

        {activeTab === 'internships' && (
          <div className="rejected-grid">
            {rejectedInternships.length === 0 ? (
              <div className="empty-state">
                <User className="w-16 h-16 mb-4" />
                <h3>No Rejected Internships</h3>
                <p>All internships are either approved or pending</p>
              </div>
            ) : (
              rejectedInternships.map(internship => renderRejectedCard(internship, 'internship'))
            )}
          </div>
        )}

        {activeTab === 'roac-prime' && (
          <div className="rejected-grid">
            {rejectedROACPrime.length === 0 ? (
              <div className="empty-state">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h3>No Rejected ROAC Prime Content</h3>
                <p>All ROAC Prime content is either approved or pending</p>
              </div>
            ) : (
              rejectedROACPrime.map(content => renderRejectedCard(content, 'roac-prime'))
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rejected {
                selectedItem?.type === 'job' ? 'Job' :
                selectedItem?.type === 'event' ? 'Event' :
                selectedItem?.type === 'internship' ? 'Internship' :
                selectedItem?.type === 'roac-prime' ? 'ROAC Prime Content' : 'Item'
              } Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{selectedItem.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Company/Organization:</span>
                    <span className="detail-value">{selectedItem.companyName || selectedItem.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(selectedItem.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rejected:</span>
                    <span className="detail-value">{formatDate(selectedItem.approvedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Rejection Information</h4>
                <div className="rejection-details">
                  <div className="rejection-reason-display">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="reason-label">Reason for Rejection:</span>
                      <p className="reason-text">{selectedItem.rejectionReason || 'No reason provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="description-text">{selectedItem.description}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button 
                className="btn-resubmit"
                onClick={() => {
                  handleAllowResubmission(selectedItem.type, selectedItem.id);
                  setShowDetailsModal(false);
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Allow Resubmission
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RejectedItemsTab;