// src/components/admin/AdminDashboard/tabs/JobsTab.jsx
import { useState, useEffect } from "react";
import { Briefcase, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import apiService from "../../../services/api";
import { toast } from "react-toastify";
import "./JobsTab.css";

const JobsTab = ({ jobs: initialJobs }) => {
  const [jobs, setJobs] = useState(initialJobs || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(status && { status })
      };
      
      const response = await apiService.getAdminJobs(params);
      setJobs(response.jobs || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(1, searchQuery, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#4CAF50';
      case 'closed': return '#F44336';
      case 'paused': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await apiService.updateJobStatus(jobId, newStatus);
      toast.success(`Job status updated to ${newStatus}`);
      fetchJobs(currentPage, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteJobAdmin(jobId);
      toast.success('Job deleted successfully');
      fetchJobs(currentPage, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-enhanced-job-management">
        <div className="admin-job-management-header">
          <div className="admin-header-title">
            <h3>Job Management</h3>
            <p>Manage and monitor all job postings</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search-filter-container">
              <div className="admin-search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        <div className="jobs-grid-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="w-16 h-16 mb-4" />
              <h4>No Jobs Found</h4>
              <p>No jobs match your current filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="jobs-table-container">
                <table className="admin-jobs-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Posted</th>
                      <th>Recruiter</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="job-row">
                        <td>
                          <div className="job-title-cell">
                            <h4 className="job-title">{job.title}</h4>
                            <p className="job-company">{job.companyName}</p>
                          </div>
                        </td>
                        <td className="location-cell">{job.location || 'Remote'}</td>
                        <td className="type-cell">{job.jobType || 'Full-time'}</td>
                        <td className="date-cell">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="recruiter-cell">{job.recruiter?.fullName || 'Unknown'}</td>
                        <td className="status-cell">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(job.status) }}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="job-actions">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => window.open(`/event-detail/jobs/${job.slug || job.id}`, '_blank')}
                              title="View Job"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <select 
                              className="status-select"
                              value={job.status}
                              onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                              title="Change Status"
                            >
                              <option value="open">Open</option>
                              <option value="closed">Closed</option>
                              <option value="paused">Paused</option>
                            </select>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteJob(job.id)}
                              title="Delete Job"
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
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={`card-${job.id}`} className="enhanced-job-card">
                    <div className="job-card-header">
                      <div className="job-title-section">
                        <h4>{job.title}</h4>
                        <p className="job-company">{job.companyName}</p>
                      </div>
                      <span 
                        className="enhanced-status-badge"
                        style={{ backgroundColor: getStatusColor(job.status) }}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="job-card-body">
                      <div className="job-details">
                        <div className="job-detail-item">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{job.location || 'Remote'}</span>
                        </div>
                        <div className="job-detail-item">
                          <span className="detail-label">Type</span>
                          <span className="detail-value">{job.jobType || 'Full-time'}</span>
                        </div>
                        <div className="job-detail-item">
                          <span className="detail-label">Posted</span>
                          <span className="detail-value">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="job-detail-item">
                          <span className="detail-label">Recruiter</span>
                          <span className="detail-value">{job.recruiter?.fullName || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <div className="job-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => window.open(`/event-detail/jobs/${job.slug || job.id}`, '_blank')}
                          title="View Job"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <select 
                          className="status-select"
                          value={job.status}
                          onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                          title="Change Status"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="paused">Paused</option>
                        </select>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete Job"
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
              onClick={() => fetchJobs(currentPage - 1, searchQuery, statusFilter)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => fetchJobs(currentPage + 1, searchQuery, statusFilter)}
            >
              Next
            </button>
          </div>
        )}

        <div className="job-stats-summary">
          <div className="stats-summary-card">
            <div className="summary-stat">
              <span className="summary-number">{jobs.filter(j => j.status === 'open').length}</span>
              <span className="summary-label">Open Jobs</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{jobs.filter(j => j.status === 'closed').length}</span>
              <span className="summary-label">Closed</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{jobs.filter(j => j.status === 'paused').length}</span>
              <span className="summary-label">Paused</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{jobs.length}</span>
              <span className="summary-label">Total Jobs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobsTab;
