import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Search, Briefcase } from 'lucide-react';
import QuickListingForm from './QuickListingForm';
import UnifiedEditModal from './UnifiedEditModal/UnifiedEditModal';
import JobEvaluationOverlay from './JobEvaluationOverlay';
import { toast } from 'react-toastify';
import './ManageJobsTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ManageJobsTab = ({ authUser, setJobsTabLoading, pendingModalType, onModalTypeHandled }) => {
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'jobs', 'internships'
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickFormType, setQuickFormType] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(null);

  // Handle pending modal type from dashboard
  useEffect(() => {
    if (pendingModalType) {
      if (pendingModalType === 'job') {
        setFilterType('jobs');
        handleCreateJob();
      } else if (pendingModalType === 'internship') {
        setFilterType('internships');
        handleCreateInternship();
      }
      if (onModalTypeHandled) {
        onModalTypeHandled();
      }
    }
  }, [pendingModalType]);

  useEffect(() => {
    fetchData();
    
    // Listen for refresh events from QuickListingForm
    const handleRefresh = (event) => {
      if (event.detail.type === 'job' || event.detail.type === 'internship') {
        fetchData();
      }
    };
    
    window.addEventListener('refreshListings', handleRefresh);
    
    // Check if user came from a notification
    const urlParams = new URLSearchParams(window.location.search);
    const showRejected = urlParams.get('showRejected');
    const showPending = urlParams.get('showPending');
    
    if (showRejected === 'true') {
      setFilterStatus('rejected');
      // Clear the URL parameter
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]showRejected=true/, '');
      window.history.replaceState({}, '', newUrl);
    } else if (showPending === 'true') {
      setFilterStatus('pending');
      // Clear the URL parameter
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]showPending=true/, '');
      window.history.replaceState({}, '', newUrl);
    }
    
    return () => {
      window.removeEventListener('refreshListings', handleRefresh);
    };
  }, []);

  const fetchData = async () => {
    try {
      setJobsTabLoading(true);
      await Promise.all([fetchJobs(), fetchInternships()]);
    } finally {
      setJobsTabLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs/my-jobs?showAll=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      const userJobs = data.jobs || [];
      setJobs(userJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const fetchInternships = async () => {
    try {
      const response = await fetch(`${API_URL}/hub-content/my-content?contentType=internship`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      console.log('Internships API Response:', data);
      const userInternships = data.hubContent || [];
      console.log('Internships Array:', userInternships);
      setInternships(userInternships);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    }
  };

  const handleCreateJob = () => {
    setEditingItem(null);
    setEditingType(null);
    setQuickFormType('job');
    setShowQuickForm(true);
  };

  const handleCreateInternship = () => {
    setEditingItem(null);
    setEditingType(null);
    setQuickFormType('internship');
    setShowQuickForm(true);
  };

  const handleEditJob = (job) => {
    setEditingItem(job);
    setEditingType('job');
    setShowEditModal(true);
  };

  const handleEditInternship = (internship) => {
    setEditingItem(internship);
    setEditingType('internship');
    setShowEditModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
        setShowDeleteConfirm(null);
        toast.success('Job deleted successfully');
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    try {
      const response = await fetch(`${API_URL}/hub-content/${internshipId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setInternships(internships.filter(item => item.id !== internshipId));
        setShowDeleteConfirm(null);
        toast.success('Internship deleted successfully');
      } else {
        toast.error('Failed to delete internship');
      }
    } catch (error) {
      console.error('Error deleting internship:', error);
      toast.error('Failed to delete internship');
    }
  };

  const handleEditSuccess = () => {
    fetchJobs();
    fetchInternships();
    setShowEditModal(false);
    setEditingItem(null);
    setEditingType(null);
    toast.success('Updated successfully');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = false;
    
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'draft') {
      matchesFilter = job.approvalStatus === 'draft';
    } else if (filterStatus === 'rejected') {
      matchesFilter = job.approvalStatus === 'rejected';
    } else if (filterStatus === 'pending') {
      matchesFilter = job.approvalStatus === 'pending';
    } else if (filterStatus === 'open') {
      matchesFilter = job.status === 'open';
    } else if (filterStatus === 'closed') {
      matchesFilter = job.status === 'closed';
    } else if (filterStatus === 'paused') {
      matchesFilter = job.status === 'paused';
    } else {
      matchesFilter = job.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (internship.companyName && internship.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchesFilter = false;
    
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'draft') {
      matchesFilter = internship.approvalStatus === 'draft';
    } else if (filterStatus === 'rejected') {
      matchesFilter = internship.approvalStatus === 'rejected';
    } else if (filterStatus === 'pending') {
      matchesFilter = internship.approvalStatus === 'pending';
    } else if (filterStatus === 'open') {
      // Internships use 'published' instead of 'open'
      matchesFilter = internship.status === 'published';
    } else if (filterStatus === 'closed') {
      // Internships use 'archived' instead of 'closed'
      matchesFilter = internship.status === 'archived';
    } else {
      matchesFilter = internship.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Combine and filter by type
  const allItems = [
    ...filteredJobs.map(job => ({ ...job, itemType: 'job' })),
    ...filteredInternships.map(internship => ({ ...internship, itemType: 'internship' }))
  ];

  console.log('Filtered Jobs:', filteredJobs.length);
  console.log('Filtered Internships:', filteredInternships.length);
  console.log('All Items:', allItems.length);
  console.log('Filter Type:', filterType);

  const displayItems = filterType === 'all' 
    ? allItems 
    : filterType === 'jobs' 
      ? allItems.filter(item => item.itemType === 'job')
      : allItems.filter(item => item.itemType === 'internship');

  console.log('Display Items:', displayItems.length);

  return (
    <div className="manage-jobs-container">
      {showEvaluation ? (
        <JobEvaluationOverlay
          job={showEvaluation.type === 'job' ? showEvaluation.data : null}
          internship={showEvaluation.type === 'internship' ? showEvaluation.data : null}
          onClose={() => setShowEvaluation(null)}
        />
      ) : (
        <>
          <div className="manage-jobs-header">
            <div>
              <h2>Manage Jobs & Internships</h2>
              <p>Create, edit, and manage all your job postings and internships</p>
            </div>
            <div className="header-buttons">
              <button 
                className="btn-primary" 
                onClick={handleCreateJob}
              >
                <Plus size={20} /> Create Job
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreateInternship}
              >
                <Plus size={20} /> Create Internship
              </button>
            </div>
          </div>

          <div className="manage-jobs-filters">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search jobs and internships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                All ({jobs.length + internships.length})
              </button>
              <button
                className={filterType === 'jobs' ? 'active' : ''}
                onClick={() => setFilterType('jobs')}
              >
                <Briefcase size={16} /> Jobs ({jobs.length})
              </button>
              <button
                className={filterType === 'internships' ? 'active' : ''}
                onClick={() => setFilterType('internships')}
              >
                <Users size={16} /> Internships ({internships.length})
              </button>
            </div>
            <div className="filter-buttons" style={{ marginTop: '1rem' }}>
              <button
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                All Status
              </button>
              <button
                className={filterStatus === 'open' ? 'active' : ''}
                onClick={() => setFilterStatus('open')}
              >
                Open ({jobs.filter(j => j.status === 'open').length + internships.filter(i => i.status === 'published').length})
              </button>
              <button
                className={filterStatus === 'closed' ? 'active' : ''}
                onClick={() => setFilterStatus('closed')}
              >
                Closed ({jobs.filter(j => j.status === 'closed').length + internships.filter(i => i.status === 'archived').length})
              </button>
              <button
                className={filterStatus === 'draft' ? 'active' : ''}
                onClick={() => setFilterStatus('draft')}
              >
                Drafts ({jobs.filter(j => j.approvalStatus === 'draft').length + internships.filter(i => i.approvalStatus === 'draft').length})
              </button>
              <button
                className={filterStatus === 'pending' ? 'active' : ''}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({jobs.filter(j => j.approvalStatus === 'pending').length + internships.filter(i => i.approvalStatus === 'pending').length})
              </button>
              <button
                className={filterStatus === 'rejected' ? 'active' : ''}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected ({jobs.filter(j => j.approvalStatus === 'rejected').length + internships.filter(i => i.approvalStatus === 'rejected').length})
              </button>
              <button
                className={filterStatus === 'paused' ? 'active' : ''}
                onClick={() => setFilterStatus('paused')}
              >
                Paused ({jobs.filter(j => j.status === 'paused').length})
              </button>
            </div>
          </div>

          {displayItems.length > 0 ? (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Details</th>
                    <th>Location</th>
                    <th>Views</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map(item => (
                    <tr 
                      key={`${item.itemType}-${item.id}`}
                      className={item.approvalStatus === 'rejected' ? 'rejected-row' : ''}
                    >
                      <td>
                        <span className={`badge-type ${item.itemType === 'job' ? 'badge-job' : 'badge-internship'}`}>
                          {item.itemType === 'job' ? 'Job' : 'Internship'}
                        </span>
                      </td>
                      <td>
                        <div className="job-title-cell">
                          {item.companyLogo && (
                            <img src={item.companyLogo} alt={item.companyName} className="company-logo-small" />
                          )}
                          <div>
                            <div 
                              className="job-title clickable-title" 
                              onClick={() => setShowEvaluation({ type: item.itemType, data: item })}
                              title="Click to view applications"
                            >
                              {item.title}
                            </div>
                            {item.featured && <span className="badge-featured">Featured</span>}
                            {item.urgent && <span className="badge-urgent">Urgent</span>}
                            {item.approvalStatus === 'pending' && item.rejectionReason && (
                              <span className="badge-resubmission">Resubmission</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{item.companyName}</td>
                      <td>
                        <span className="badge-type">
                          {item.itemType === 'job' ? item.jobType : (item.duration || 'N/A')}
                        </span>
                      </td>
                      <td>{item.location || 'Remote'}</td>
                      <td>
                        <div className="stat-cell">
                          <Eye size={16} />
                          {item.views || 0}
                        </div>
                      </td>
                      <td>
                        <div className="stat-cell">
                          <Users size={16} />
                          {item.applications || 0}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="approval-status-cell">
                          <span className={`approval-badge approval-${item.approvalStatus || 'pending'}`}>
                            {item.approvalStatus || 'pending'}
                          </span>
                          {item.approvalStatus === 'rejected' && item.rejectionReason && (
                            <div className="rejection-reason-tooltip" title={item.rejectionReason}>
                              ⚠️
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {item.approvalStatus === 'rejected' ? (
                            <button
                              className="btn-icon btn-resubmit"
                              onClick={() => item.itemType === 'job' ? handleEditJob(item) : handleEditInternship(item)}
                              title="Edit & Resubmit"
                            >
                              <Edit size={18} />
                              <span className="btn-text">Resubmit</span>
                            </button>
                          ) : item.approvalStatus === 'approved' ? (
                            <>
                              <button
                                className="btn-icon"
                                onClick={() => item.itemType === 'job' ? handleEditJob(item) : handleEditInternship(item)}
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                className="btn-icon btn-view"
                                onClick={() => window.open(`/event-detail/${item.itemType === 'job' ? 'jobs' : 'internships'}/${item.slug}`, '_blank')}
                                title="View Live"
                              >
                                <Eye size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-icon"
                              onClick={() => item.itemType === 'job' ? handleEditJob(item) : handleEditInternship(item)}
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => setShowDeleteConfirm(item.id)}
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
          <div className="empty-icon">📋</div>
          <h3>No items found</h3>
          <p>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first job or internship to get started'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={handleCreateJob}
              >
                <Plus size={20} /> Create Job
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreateInternship}
              >
                <Plus size={20} /> Create Internship
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Listing Form for Create */}
      {showQuickForm && (
        <QuickListingForm
          isOpen={showQuickForm}
          onClose={() => {
            setShowQuickForm(false);
            setQuickFormType(null);
          }}
          contentType={quickFormType}
          authUser={authUser}
        />
      )}

      {/* Unified Edit Modal */}
      {!showEvaluation && showEditModal && editingItem && (
        <UnifiedEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
            setEditingType(null);
          }}
          contentType={editingType}
          editData={editingItem}
          authUser={authUser}
          onSuccess={handleEditSuccess}
        />
      )}

      {!showEvaluation && showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Item?</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  const item = displayItems.find(i => i.id === showDeleteConfirm);
                  if (item) {
                    item.itemType === 'job' ? handleDeleteJob(showDeleteConfirm) : handleDeleteInternship(showDeleteConfirm);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ManageJobsTab;
