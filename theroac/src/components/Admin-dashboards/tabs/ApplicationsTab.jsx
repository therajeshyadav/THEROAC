// src/components/admin/AdminDashboard/tabs/ApplicationsTab.jsx
import { useState, useEffect } from "react";
import { Users, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import apiService from "../../../services/api";
import { toast } from "react-toastify";
import CandidateDetailsModal from "../../recruiter-dashboard/CandidateDetailsModal";
import "./ApplicationsTab.css";

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchApplications = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(status && { status })
      };
      
      const response = await apiService.request(`/admin/applications?${new URLSearchParams(params)}`);
      setApplications(response.applications || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchApplications(1, searchQuery, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'reviewing': return '#2196F3';
      case 'shortlisted': return '#9C27B0';
      case 'interview': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'reviewing': return <Eye size={16} />;
      case 'shortlisted': return <CheckCircle size={16} />;
      case 'interview': return <Users size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-enhanced-application-management">
        <div className="admin-application-management-header">
          <div className="admin-header-title">
            <h3>Application Management</h3>
            <p>Monitor and manage all job applications</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search-filter-container">
              <div className="admin-search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
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
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="applications-grid-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <Users className="w-16 h-16 mb-4" />
              <h4>No Applications Found</h4>
              <p>No applications match your current filters</p>
            </div>
          ) : (
            <>
            {/* Desktop Table View */}
            <div className="applications-table-container">
              <table className="admin-applications-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Position</th>
                    <th>Company</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="application-row">
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
                      <td className="job-title-cell">{app.job?.title || 'N/A'}</td>
                      <td className="company-cell">{app.job?.companyName || 'N/A'}</td>
                      <td className="date-cell">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="status-cell">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(app.status) }}
                        >
                          {getStatusIcon(app.status)}
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="application-actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewDetails(app)}
                            title="View Application Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="applications-mobile-cards">
              {applications.map((app) => (
                <div key={app.id} className="application-mobile-card">
                  <div className="application-mobile-card-header">
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {app.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="candidate-name">{app.user?.fullName || 'Unknown'}</div>
                        <div className="candidate-email">{app.user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="application-mobile-card-body">
                    <div className="application-mobile-card-row">
                      <span className="application-mobile-card-label">Job Position</span>
                      <span className="application-mobile-card-value">{app.job?.title || 'N/A'}</span>
                    </div>
                    <div className="application-mobile-card-row">
                      <span className="application-mobile-card-label">Company</span>
                      <span className="application-mobile-card-value">{app.job?.companyName || 'N/A'}</span>
                    </div>
                    <div className="application-mobile-card-row">
                      <span className="application-mobile-card-label">Applied Date</span>
                      <span className="application-mobile-card-value">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="application-mobile-card-row">
                      <span className="application-mobile-card-label">Status</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {getStatusIcon(app.status)}
                        {app.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="application-mobile-card-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(app)}
                      title="View Application Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
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
              onClick={() => fetchApplications(currentPage - 1, searchQuery, statusFilter)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => fetchApplications(currentPage + 1, searchQuery, statusFilter)}
            >
              Next
            </button>
          </div>
        )}

        <div className="application-stats-summary">
          <div className="stats-summary-card">
            <div className="summary-stat">
              <span className="summary-number">{applications.filter(a => a.status === 'pending').length}</span>
              <span className="summary-label">Pending</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{applications.filter(a => a.status === 'reviewing').length}</span>
              <span className="summary-label">Reviewing</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{applications.filter(a => a.status === 'accepted').length}</span>
              <span className="summary-label">Accepted</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{applications.length}</span>
              <span className="summary-label">Total Applications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <CandidateDetailsModal
        isOpen={showDetailsModal}
        application={selectedApplication}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        onStatusUpdate={() => {
          // Close modal after status update
          setShowDetailsModal(false);
          setSelectedApplication(null);
          // Refresh applications to get updated data
          fetchApplications(currentPage, searchQuery, statusFilter);
        }}
      />
    </section>
  );
};

export default ApplicationsTab;