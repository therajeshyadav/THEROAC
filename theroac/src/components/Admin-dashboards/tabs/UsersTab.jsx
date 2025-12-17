// src/components/admin/AdminDashboard/tabs/UsersTab.jsx
import { useState, useEffect } from "react";
import { Users, UserCheck, Shield, Search, Filter } from "lucide-react";
import apiService from "../../../services/api";
import { toast } from "react-toastify";
import UserProfileModal from "../UserProfileModal";
import "./UsersTab.css";

const UsersTab = ({ users: initialUsers, getUserInitials, updateUserStatus, currentAdminId }) => {
  const [users, setUsers] = useState(initialUsers || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  const fetchUsers = async (page = 1, search = "", role = "", status = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status })
      };
      
      const response = await apiService.getAdminUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchQuery, roleFilter, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleStatusUpdate = async (userId, newStatus, userName) => {
    // Prevent admin from banning themselves (frontend safeguard)
    if (userId === currentAdminId && newStatus === 'banned') {
      toast.error('You cannot ban yourself. Please ask another admin to perform this action if needed.');
      return;
    }

    // Show confirmation dialog for banning users
    if (newStatus === 'banned') {
      const confirmBan = window.confirm(
        `Are you sure you want to ban "${userName}"?\n\n` +
        `This will:\n` +
        `• Prevent them from logging into the platform\n` +
        `• Block access to all features\n` +
        `• Show them a banned message with admin contact info\n\n` +
        `This action can be reversed by changing their status back to "Active".`
      );
      
      if (!confirmBan) {
        return; // User cancelled the ban
      }
    }

    try {
      await updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers(currentPage, searchQuery, roleFilter, statusFilter);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-enhanced-user-management">
        <div className="admin-user-management-header">
          <div className="admin-header-title">
            <h3>User Management</h3>
            <p>Manage and monitor all platform users</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search-filter-container">
              <div className="admin-search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="admin-filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="candidate">Candidate</option>
              </select>
              <select 
                className="admin-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="users-grid-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <Users className="w-16 h-16 mb-4" />
              <h4>No Users Found</h4>
              <p>No users match your current filters</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className={`enhanced-user-card ${user.id === currentAdminId ? 'current-admin' : ''}`}>
                  <div className="user-card-header">
                    <div className="user-avatar-section">
                      <div className="user-avatar-large">
                        {user.profilePicture || user.avatar ? (
                          <img
                            src={user.profilePicture || user.avatar}
                            alt={user.fullName || "User"}
                            className="profile-image"
                          />
                        ) : (
                          <span className="profile-initials">
                            {getUserInitials(user.fullName)}
                          </span>
                        )}
                      </div>
                      <div className="user-basic-info">
                        <h4 className="user-name">
                          {user.fullName}
                          {user.id === currentAdminId && <span className="current-admin-badge">You</span>}
                        </h4>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="user-status-badges">
                      <span className={`enhanced-role-badge ${user.role}`}>
                        {user.role}
                      </span>
                      <span
                        className={`enhanced-status-badge ${user.status}`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>

                  <div className="user-card-body">
                    <div className="user-stats">
                      <div className="user-stat-item">
                        <span className="stat-label">Joined</span>
                        <span className="stat-value">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="user-stat-item">
                        <span className="stat-label">Last Login</span>
                        <span className="stat-value">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "Never"}
                        </span>
                      </div>
                      {user.phone && (
                        <div className="user-stat-item">
                          <span className="stat-label">Phone</span>
                          <span className="stat-value">{user.phone}</span>
                        </div>
                      )}
                      {(user.city || user.state || user.country) && (
                        <div className="user-stat-item">
                          <span className="stat-label">Location</span>
                          <span className="stat-value">
                            {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="user-card-footer">
                    <div className="user-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewProfile(user)}
                      >
                        <UserCheck className="w-4 h-4" />
                        View Profile
                      </button>
                      {user.status === "active" ? (
                        <button
                          className="action-btn ban-btn"
                          onClick={() =>
                            handleStatusUpdate(user.id, "banned", user.fullName)
                          }
                        >
                          <Shield className="w-4 h-4" />
                          Ban User
                        </button>
                      ) : (
                        <button
                          className="action-btn activate-btn"
                          onClick={() =>
                            handleStatusUpdate(user.id, "active", user.fullName)
                          }
                        >
                          <UserCheck className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button 
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => fetchUsers(currentPage - 1, searchQuery, roleFilter, statusFilter)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => fetchUsers(currentPage + 1, searchQuery, roleFilter, statusFilter)}
            >
              Next
            </button>
          </div>
        )}

        <div className="user-stats-summary">
          <div className="stats-summary-card">
            <div className="summary-stat">
              <span className="summary-number">{activeCount}</span>
              <span className="summary-label">Active Users</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{pendingCount}</span>
              <span className="summary-label">Pending</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{bannedCount}</span>
              <span className="summary-label">Banned</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{users.length}</span>
              <span className="summary-label">Total Users</span>
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal}
        getUserInitials={getUserInitials}
      />
    </section>
  );
};

export default UsersTab;
