import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Search, Briefcase } from 'lucide-react';
import JobFormModal from './JobFormModal';
import InternshipFormModal from './InternshipFormModal';
import JobEvaluationOverlay from './JobEvaluationOverlay';
import { toast } from 'react-toastify';
import './ManageJobsTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ManageJobsTab = ({ authUser, setJobsTabLoading, pendingModalType, onModalTypeHandled }) => {
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeView, setActiveView] = useState('jobs'); // 'jobs' or 'internships'
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(null);

  // Handle pending modal type from dashboard
  useEffect(() => {
    if (pendingModalType) {
      if (pendingModalType === 'job') {
        setActiveView('jobs');
        handleCreateJob();
      } else if (pendingModalType === 'internship') {
        setActiveView('internships');
        handleCreateInternship();
      }
      if (onModalTypeHandled) {
        onModalTypeHandled();
      }
    }
  }, [pendingModalType]);

  useEffect(() => {
    fetchData();
    
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
      const userInternships = data.hubContent || [];
      setInternships(userInternships);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setEditingInternship(null);
    setShowFormModal(true);
  };

  const handleCreateInternship = () => {
    setEditingInternship(null);
    setEditingJob(null);
    setShowFormModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditingInternship(null);
    setShowFormModal(true);
  };

  const handleEditInternship = (internship) => {
    setEditingInternship(internship);
    setEditingJob(null);
    setShowFormModal(true);
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

  const handleFormSuccess = () => {
    if (activeView === 'jobs') {
      fetchJobs();
    } else {
      fetchInternships();
    }
    setShowFormModal(false);
    setEditingJob(null);
    setEditingInternship(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = false;
    
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'rejected') {
      matchesFilter = job.approvalStatus === 'rejected';
    } else if (filterStatus === 'pending') {
      matchesFilter = job.approvalStatus === 'pending';
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
    } else if (filterStatus === 'rejected') {
      matchesFilter = internship.approvalStatus === 'rejected';
    } else if (filterStatus === 'pending') {
      matchesFilter = internship.approvalStatus === 'pending';
    } else {
      matchesFilter = internship.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

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
            className={`btn-view-toggle ${activeView === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveView('jobs')}
          >
            <Briefcase size={18} /> Jobs ({jobs.length})
          </button>
          <button 
            className={`btn-view-toggle ${activeView === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveView('internships')}
          >
            <Users size={18} /> Internships ({internships.length})
          </button>
          <button 
            className="btn-primary" 
            onClick={activeView === 'jobs' ? handleCreateJob : handleCreateInternship}
          >
            <Plus size={20} /> Create New {activeView === 'jobs' ? 'Job' : 'Internship'}
          </button>
        </div>
      </div>

      <div className="manage-jobs-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={`Search ${activeView}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All ({activeView === 'jobs' ? jobs.length : internships.length})
          </button>
          <button
            className={filterStatus === 'open' ? 'active' : ''}
            onClick={() => setFilterStatus('open')}
          >
            Open ({activeView === 'jobs' ? jobs.filter(j => j.status === 'open').length : internships.filter(i => i.status === 'published').length})
          </button>
          <button
            className={filterStatus === 'closed' ? 'active' : ''}
            onClick={() => setFilterStatus('closed')}
          >
            Closed ({activeView === 'jobs' ? jobs.filter(j => j.status === 'closed').length : internships.filter(i => i.status === 'archived').length})
          </button>
          <button
            className={filterStatus === 'pending' ? 'active' : ''}
            onClick={() => setFilterStatus('pending')}
          >
            Pending Approval ({activeView === 'jobs' ? jobs.filter(j => j.approvalStatus === 'pending').length : internships.filter(i => i.approvalStatus === 'pending').length})
          </button>
          <button
            className={filterStatus === 'rejected' ? 'active' : ''}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected ({activeView === 'jobs' ? jobs.filter(j => j.approvalStatus === 'rejected').length : internships.filter(i => i.approvalStatus === 'rejected').length})
          </button>
          {activeView === 'jobs' && (
            <button
              className={filterStatus === 'paused' ? 'active' : ''}
              onClick={() => setFilterStatus('paused')}
            >
              Paused ({jobs.filter(j => j.status === 'paused').length})
            </button>
          )}
        </div>
      </div>

      {activeView === 'jobs' && filteredJobs.length > 0 ? (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Type</th>
                <th>Location</th>
                <th>Views</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div className="job-title-cell">
                      {job.companyLogo && (
                        <img src={job.companyLogo} alt={job.companyName} className="company-logo-small" />
                      )}
                      <div>
                        <div 
                          className="job-title clickable-title" 
                          onClick={() => setShowEvaluation({ type: 'job', data: job })}
                          title="Click to view applications"
                        >
                          {job.title}
                        </div>
                        {job.featured && <span className="badge-featured">Featured</span>}
                        {job.urgent && <span className="badge-urgent">Urgent</span>}
                        {job.approvalStatus === 'pending' && job.rejectionReason && (
                          <span className="badge-resubmission">Resubmission</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{job.companyName}</td>
                  <td>
                    <span className="badge-type">{job.jobType}</span>
                  </td>
                  <td>{job.location || 'Remote'}</td>
                  <td>
                    <div className="stat-cell">
                      <Eye size={16} />
                      {job.views || 0}
                    </div>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <Users size={16} />
                      {job.applications || 0}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="approval-status-cell">
                      <span className={`approval-badge approval-${job.approvalStatus || 'pending'}`}>
                        {job.approvalStatus || 'pending'}
                      </span>
                      {job.approvalStatus === 'rejected' && job.rejectionReason && (
                        <div className="rejection-reason-tooltip" title={job.rejectionReason}>
                          ⚠️
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {job.approvalStatus === 'rejected' ? (
                        <button
                          className="btn-icon btn-resubmit"
                          onClick={() => handleEditJob(job)}
                          title="Edit & Resubmit"
                        >
                          <Edit size={18} />
                          <span className="btn-text">Resubmit</span>
                        </button>
                      ) : job.approvalStatus === 'approved' ? (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => handleEditJob(job)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-view"
                            onClick={() => window.open(`/event-detail/jobs/${job.slug}`, '_blank')}
                            title="View Live"
                          >
                            <Eye size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-icon"
                          onClick={() => handleEditJob(job)}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => setShowDeleteConfirm(job.id)}
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
      ) : activeView === 'internships' && filteredInternships.length > 0 ? (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Internship Title</th>
                <th>Company</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Views</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInternships.map(internship => (
                <tr key={internship.id}>
                  <td>
                    <div className="job-title-cell">
                      {internship.companyLogo && (
                        <img src={internship.companyLogo} alt={internship.companyName} className="company-logo-small" />
                      )}
                      <div>
                        <div 
                          className="job-title clickable-title" 
                          onClick={() => setShowEvaluation({ type: 'internship', data: internship })}
                          title="Click to view applications"
                        >
                          {internship.title}
                        </div>
                        {internship.featured && <span className="badge-featured">Featured</span>}
                        {internship.approvalStatus === 'pending' && internship.rejectionReason && (
                          <span className="badge-resubmission">Resubmission</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{internship.companyName || 'N/A'}</td>
                  <td>
                    <span className="badge-type">{internship.duration || 'N/A'}</span>
                  </td>
                  <td>{internship.location || 'Remote'}</td>
                  <td>
                    <div className="stat-cell">
                      <Eye size={16} />
                      {internship.views || 0}
                    </div>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <Users size={16} />
                      {internship.applications || 0}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${internship.status}`}>
                      {internship.status}
                    </span>
                  </td>
                  <td>
                    <div className="approval-status-cell">
                      <span className={`approval-badge approval-${internship.approvalStatus || 'pending'}`}>
                        {internship.approvalStatus || 'pending'}
                      </span>
                      {internship.approvalStatus === 'rejected' && internship.rejectionReason && (
                        <div className="rejection-reason-tooltip" title={internship.rejectionReason}>
                          ⚠️
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {internship.approvalStatus === 'rejected' ? (
                        <button
                          className="btn-icon btn-resubmit"
                          onClick={() => handleEditInternship(internship)}
                          title="Edit & Resubmit"
                        >
                          <Edit size={18} />
                          <span className="btn-text">Resubmit</span>
                        </button>
                      ) : internship.approvalStatus === 'approved' ? (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => handleEditInternship(internship)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-view"
                            onClick={() => window.open(`/event-detail/internships/${internship.slug}`, '_blank')}
                            title="View Live"
                          >
                            <Eye size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-icon"
                          onClick={() => handleEditInternship(internship)}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => setShowDeleteConfirm(internship.id)}
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
          <div className="empty-icon">{activeView === 'jobs' ? '📋' : '🎓'}</div>
          <h3>No {activeView} found</h3>
          <p>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : `Create your first ${activeView === 'jobs' ? 'job posting' : 'internship'} to get started`}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button 
              className="btn-primary" 
              onClick={activeView === 'jobs' ? handleCreateJob : handleCreateInternship}
            >
              <Plus size={20} /> Create First {activeView === 'jobs' ? 'Job' : 'Internship'}
            </button>
          )}
        </div>
      )}

      {!showEvaluation && showFormModal && activeView === 'jobs' && (
        <JobFormModal
          job={editingJob}
          authUser={authUser}
          onClose={() => {
            setShowFormModal(false);
            setEditingJob(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {!showEvaluation && showFormModal && activeView === 'internships' && (
        <InternshipFormModal
          internship={editingInternship}
          authUser={authUser}
          onClose={() => {
            setShowFormModal(false);
            setEditingInternship(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {!showEvaluation && showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete {activeView === 'jobs' ? 'Job' : 'Internship'}?</h3>
            <p>Are you sure you want to delete this {activeView === 'jobs' ? 'job posting' : 'internship'}? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => activeView === 'jobs' ? handleDeleteJob(showDeleteConfirm) : handleDeleteInternship(showDeleteConfirm)}
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
