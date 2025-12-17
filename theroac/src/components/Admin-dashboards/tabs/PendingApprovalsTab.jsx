import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Briefcase, Calendar, User, MessageSquare } from 'lucide-react';
import apiService from '../../../services/api';
import { toast } from 'react-toastify';
import './PendingApprovalsTab.css';

const PendingApprovalsTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingInternships, setPendingInternships] = useState([]);
  const [pendingROACPrime, setPendingROACPrime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingApprovals();
      
      // Ensure all arrays are properly initialized and contain valid objects
      setPendingJobs(Array.isArray(response.pendingJobs) ? response.pendingJobs.filter(job => job && job.id) : []);
      setPendingEvents(Array.isArray(response.pendingEvents) ? response.pendingEvents.filter(event => event && event.id) : []);
      setPendingInternships(Array.isArray(response.pendingInternships) ? response.pendingInternships.filter(internship => internship && internship.id) : []);
      setPendingROACPrime(Array.isArray(response.pendingROACPrime) ? response.pendingROACPrime.filter(content => content && content.id) : []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
      // Set empty arrays on error to prevent rendering issues
      setPendingJobs([]);
      setPendingEvents([]);
      setPendingInternships([]);
      setPendingROACPrime([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      let endpoint;
      let successMessage;
      
      switch (type) {
        case 'job':
          endpoint = `/admin/jobs/${id}/approve`;
          successMessage = 'Job approved successfully!';
          break;
        case 'event':
          endpoint = `/admin/events/${id}/approve`;
          successMessage = 'Event approved successfully!';
          break;
        case 'internship':
          endpoint = `/admin/internships/${id}/approve`;
          successMessage = 'Internship approved successfully!';
          break;
        case 'roac-prime':
          endpoint = `/admin/roac-prime/${id}/approve`;
          successMessage = 'ROAC Prime content approved successfully!';
          break;
        default:
          throw new Error('Invalid type');
      }

      await apiService.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' })
      });
      
      toast.success(successMessage);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error(`Failed to approve ${type}`);
    }
  };

  const handleReject = async (type, id) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      let endpoint;
      let successMessage;
      
      switch (type) {
        case 'job':
          endpoint = `/admin/jobs/${id}/approve`;
          successMessage = 'Job rejected successfully!';
          break;
        case 'event':
          endpoint = `/admin/events/${id}/approve`;
          successMessage = 'Event rejected successfully!';
          break;
        case 'internship':
          endpoint = `/admin/internships/${id}/approve`;
          successMessage = 'Internship rejected successfully!';
          break;
        case 'roac-prime':
          endpoint = `/admin/roac-prime/${id}/approve`;
          successMessage = 'ROAC Prime content rejected successfully!';
          break;
        default:
          throw new Error('Invalid type');
      }

      await apiService.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ 
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        })
      });
      
      toast.success(successMessage);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedItem(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error(`Failed to reject ${type}`);
    }
  };

  const openRejectModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowRejectModal(true);
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

  const renderJobCard = (job) => {
    if (!job || !job.id) return null;
    return (
    <div key={job.id} className="approval-card">
      <div className="approval-card-header">
        <div className="approval-info">
          <div className="approval-icon">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="approval-title">{job.title}</h4>
            <p className="approval-company">{job.companyName || 'Company'}</p>
            <p className="approval-meta">
              Posted by: {job.recruiter?.fullName || 'Unknown'} • {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="approval-status">
          <span className="status-badge pending">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>
      </div>

      <div className="approval-details">
        <div className="detail-item">
          <span className="detail-label">Job Type:</span>
          <span className="detail-value">{job.jobType || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{job.location || 'Remote'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Experience:</span>
          <span className="detail-value">{job.experienceLevel || 'Not specified'}</span>
        </div>
      </div>

      <div className="approval-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => openDetailsModal(job, 'job')}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button 
          className="action-btn approve-btn"
          onClick={() => handleApprove('job', job.id)}
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button 
          className="action-btn reject-btn"
          onClick={() => openRejectModal(job, 'job')}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
    );
  };

  const renderEventCard = (event) => {
    if (!event || !event.id) return null;
    return (
    <div key={event.id} className="approval-card">
      <div className="approval-card-header">
        <div className="approval-info">
          <div className="approval-icon">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="approval-title">{event.title}</h4>
            <p className="approval-company">{event.location || 'Online Event'}</p>
            <p className="approval-meta">
              Created by: {event.organizer?.fullName || 'Unknown'} • {formatDate(event.createdAt)}
            </p>
          </div>
        </div>
        <div className="approval-status">
          <span className="status-badge pending">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>
      </div>

      <div className="approval-details">
        <div className="detail-item">
          <span className="detail-label">Start Date:</span>
          <span className="detail-value">{formatDate(event.startDate)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Location Type:</span>
          <span className="detail-value">{event.locationType || 'Online'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className="detail-value">{event.status}</span>
        </div>
      </div>

      <div className="approval-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => openDetailsModal(event, 'event')}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button 
          className="action-btn approve-btn"
          onClick={() => handleApprove('event', event.id)}
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button 
          className="action-btn reject-btn"
          onClick={() => openRejectModal(event, 'event')}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
    );
  };

  const renderInternshipCard = (internship) => {
    if (!internship || !internship.id) return null;
    return (
    <div key={internship.id} className="approval-card">
      <div className="approval-card-header">
        <div className="approval-info">
          <div className="approval-icon">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="approval-title">{internship.title}</h4>
            <p className="approval-company">{internship.companyName || 'Company'}</p>
            <p className="approval-meta">
              Created by: {internship.author?.fullName || 'Unknown'} • {formatDate(internship.createdAt)}
            </p>
          </div>
        </div>
        <div className="approval-status">
          <span className="status-badge pending">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>
      </div>

      <div className="approval-details">
        <div className="detail-item">
          <span className="detail-label">Duration:</span>
          <span className="detail-value">{internship.duration || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{internship.location || 'Remote'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Stipend:</span>
          <span className="detail-value">
            {internship.stipend && typeof internship.stipend === 'object' && internship.stipend.amount 
              ? `${internship.stipend.amount} ${internship.stipend.currency || 'USD'}` 
              : 'Not specified'}
          </span>
        </div>
      </div>

      <div className="approval-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => openDetailsModal(internship, 'internship')}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button 
          className="action-btn approve-btn"
          onClick={() => handleApprove('internship', internship.id)}
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button 
          className="action-btn reject-btn"
          onClick={() => openRejectModal(internship, 'internship')}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
    );
  };

  const renderROACPrimeCard = (content) => {
    if (!content || !content.id) return null;
    return (
    <div key={content.id} className="approval-card">
      <div className="approval-card-header">
        <div className="approval-info">
          <div className="approval-icon">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="approval-title">{content.title}</h4>
            <p className="approval-company">
              {content.title === 'ROAC Talent Prime Hub' ? 'Platform Feature' : 'ROAC Prime'} • {
                content.title === 'ROAC Talent Prime Hub' ? 'Hub Feature' : content.contentType || 'Content'
              }
            </p>
            <p className="approval-meta">
              Created by: {content.author?.fullName || 'System'} • {formatDate(content.createdAt)}
            </p>
          </div>
        </div>
        <div className="approval-status">
          <span className="status-badge pending">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>
      </div>

      <div className="approval-details">
        <div className="detail-item">
          <span className="detail-label">Content Type:</span>
          <span className="detail-value">{content.contentType || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Category:</span>
          <span className="detail-value">{content.category || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Company:</span>
          <span className="detail-value">{content.companyName || 'Not specified'}</span>
        </div>
      </div>

      <div className="approval-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => openDetailsModal(content, 'roac-prime')}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button 
          className="action-btn approve-btn"
          onClick={() => handleApprove('roac-prime', content.id)}
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button 
          className="action-btn reject-btn"
          onClick={() => openRejectModal(content, 'roac-prime')}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <section className="admin-tab-content">
      <div className="pending-approvals-header">
        <div>
          <h2>Pending Approvals</h2>
          <p>Review and approve jobs, events, internships, and ROAC Prime content posted by recruiters</p>
        </div>
        <div className="approval-stats">
          <div className="stat-item">
            <span className="stat-value">{pendingJobs.length}</span>
            <span className="stat-label">Pending Jobs</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{pendingEvents.length}</span>
            <span className="stat-label">Pending Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{pendingInternships.length}</span>
            <span className="stat-label">Pending Internships</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{pendingROACPrime.length}</span>
            <span className="stat-label">Pending ROAC Prime</span>
          </div>
        </div>
      </div>

      <div className="approval-tabs">
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase className="w-4 h-4" />
          Jobs ({pendingJobs.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar className="w-4 h-4" />
          Events ({pendingEvents.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'internships' ? 'active' : ''}`}
          onClick={() => setActiveTab('internships')}
        >
          <User className="w-4 h-4" />
          Internships ({pendingInternships.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roac-prime' ? 'active' : ''}`}
          onClick={() => setActiveTab('roac-prime')}
        >
          <MessageSquare className="w-4 h-4" />
          ROAC Prime ({pendingROACPrime.length})
        </button>
      </div>

      <div className="approval-content">
        {activeTab === 'jobs' && (
          <div className="approval-grid">
            {pendingJobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase className="w-16 h-16 mb-4" />
                <h3>No Pending Jobs</h3>
                <p>All jobs have been reviewed</p>
              </div>
            ) : (
              pendingJobs.map(renderJobCard).filter(Boolean)
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="approval-grid">
            {pendingEvents.length === 0 ? (
              <div className="empty-state">
                <Calendar className="w-16 h-16 mb-4" />
                <h3>No Pending Events</h3>
                <p>All events have been reviewed</p>
              </div>
            ) : (
              pendingEvents.map(renderEventCard).filter(Boolean)
            )}
          </div>
        )}

        {activeTab === 'internships' && (
          <div className="approval-grid">
            {pendingInternships.length === 0 ? (
              <div className="empty-state">
                <User className="w-16 h-16 mb-4" />
                <h3>No Pending Internships</h3>
                <p>All internships have been reviewed</p>
              </div>
            ) : (
              pendingInternships.map(renderInternshipCard).filter(Boolean)
            )}
          </div>
        )}

        {activeTab === 'roac-prime' && (
          <div className="approval-grid">
            {pendingROACPrime.length === 0 ? (
              <div className="empty-state">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h3>No Pending ROAC Prime Content</h3>
                <p>All ROAC Prime content has been reviewed</p>
              </div>
            ) : (
              pendingROACPrime.map(renderROACPrimeCard).filter(Boolean)
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pending {
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
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className="status-badge pending">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created by:</span>
                    <span className="detail-value">
                      {selectedItem.recruiter?.fullName || selectedItem.organizer?.fullName || selectedItem.author?.fullName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="description-text">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.content && (
                <div className="detail-section">
                  <h4>Content</h4>
                  <div className="content-preview">
                    {selectedItem.content.length > 500 
                      ? `${selectedItem.content.substring(0, 500)}...` 
                      : selectedItem.content
                    }
                  </div>
                </div>
              )}

              {(selectedItem.requirements || selectedItem.responsibilities || selectedItem.skills) && (
                <div className="detail-section">
                  <h4>Additional Details</h4>
                  <div className="detail-grid">
                    {selectedItem.requirements && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Requirements:</span>
                        <span className="detail-value">{selectedItem.requirements}</span>
                      </div>
                    )}
                    {selectedItem.responsibilities && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Responsibilities:</span>
                        <span className="detail-value">{selectedItem.responsibilities}</span>
                      </div>
                    )}
                    {selectedItem.skills && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Skills:</span>
                        <span className="detail-value">{selectedItem.skills}</span>
                      </div>
                    )}
                  </div>
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
                className="btn-approve"
                onClick={() => {
                  handleApprove(selectedItem.type, selectedItem.id);
                  setShowDetailsModal(false);
                }}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button 
                className="btn-reject"
                onClick={() => {
                  setShowDetailsModal(false);
                  openRejectModal(selectedItem, selectedItem.type);
                }}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject {
                selectedItem?.type === 'job' ? 'Job' :
                selectedItem?.type === 'event' ? 'Event' :
                selectedItem?.type === 'internship' ? 'Internship' :
                selectedItem?.type === 'roac-prime' ? 'ROAC Prime Content' : 'Item'
              }</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting "{selectedItem?.title}":</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="rejection-textarea"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-reject"
                onClick={() => handleReject(selectedItem?.type, selectedItem?.id)}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PendingApprovalsTab;