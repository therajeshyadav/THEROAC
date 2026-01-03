import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import CandidateDetailsModal from './CandidateDetailsModal';
import { toast } from 'react-toastify';
import './EvaluateCandidatesTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EvaluateCandidatesTab = ({ authUser }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const userJobs = data.jobs?.filter(job => job.createdBy === authUser?.id) || [];
      setJobs(userJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/dashboard/candidates?limit=1000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      
      // Transform dashboard candidates format to match expected application format
      const transformedApplications = (data.candidates || []).map(candidate => {
        return {
        id: candidate.id,
        originalId: candidate.originalId,
        type: candidate.type, // 'job', 'internship', or 'event'
        status: candidate.stage || 'pending',
        createdAt: candidate.createdAt || candidate.appliedDate,
        user: {
          fullName: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          headline: candidate.headline,
          about: candidate.about,
          skills: candidate.skills,
          experiences: candidate.experiences,
          education: candidate.education,
          resumePath: candidate.resumeLink, // Map resumeLink to resumePath for consistency
          profilePicture: candidate.profilePicture,
          linkedinUrl: candidate.linkedinUrl,
          githubUrl: candidate.githubUrl,
          location: candidate.location
        },
        job: {
          title: candidate.position,
          companyName: candidate.department
        },
        resumeLink: candidate.resumeLink,
        coverLetter: candidate.coverLetter,
        notes: candidate.notes,
        metadata: candidate.metadata || {}
      };
      });
      
      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Application ${newStatus} successfully`);
        fetchApplications();
        if (selectedApplication?.id === applicationId) {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowDetailsModal(true);
  };



  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesJob = filterJob === 'all' || app.jobId === filterJob;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'reviewing': return '#2196F3';
      case 'interview': return '#9C27B0';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'reviewing': return <Eye size={16} />;
      case 'interview': return <User size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="evaluate-candidates-container">
      <div className="evaluate-header">
        <div>
          <h2>Evaluate Candidates</h2>
          <p>Review and manage job applications</p>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{applications.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{applications.filter(a => a.status === 'pending').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Interview</span>
            <span className="stat-value">{applications.filter(a => a.status === 'interview').length}</span>
          </div>
        </div>
      </div>

      <div className="evaluate-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <User size={64} style={{ opacity: 0.3 }} />
          <h3>No applications found</h3>
          <p>
            {searchQuery || filterStatus !== 'all' || filterJob !== 'all'
              ? 'Try adjusting your filters'
              : 'Applications will appear here when candidates apply to your jobs'}
          </p>
        </div>
      ) : (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position/Event</th>
                <th>Type</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {app.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="candidate-name">{app.user?.fullName || 'Unknown'}</div>
                        <div className="candidate-email">{app.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="job-info">
                      <div className="job-title">{app.job?.title || 'N/A'}</div>
                      <div className="job-company">{app.job?.companyName}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge type-${app.type || 'job'}`}>
                      {app.type === 'job' ? 'Job' : 
                       app.type === 'internship' ? 'Internship' : 
                       app.type === 'event' ? 'Event' : 'Job'}
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)}
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleViewDetails(app)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleStatusUpdate(app.id, 'interview')}
                            title="Schedule Interview"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CandidateDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onStatusUpdate={fetchApplications}
      />
    </div>
  );
};

export default EvaluateCandidatesTab;
