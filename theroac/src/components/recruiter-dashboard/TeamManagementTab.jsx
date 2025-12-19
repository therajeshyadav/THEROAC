import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, Check, X, Settings } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TeamManagementTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const TeamManagementTab = ({ authUser, onTabChange }) => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({
    canManageJobs: false,
    canManageEvents: false,
    canManageTeam: false,
    canViewAnalytics: false,
    canManageApplications: false,
    canPostJobs: false,
    canPostEvents: false,
    canEditJobs: false,
    canEditEvents: false,
    canDeleteJobs: false,
    canDeleteEvents: false,
    canRespondToApplications: false
  });

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current organization
      const orgResponse = await axios.get(`${API_URL}/organizations/my-organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orgResponse.data.organizations && orgResponse.data.organizations.length > 0) {
        const currentOrg = orgResponse.data.organizations[0];
        setOrganization(currentOrg);

        // Get members
        const membersResponse = await axios.get(`${API_URL}/organizations/${currentOrg.id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(membersResponse.data.members);
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/organizations/${organization.id}/members/invite`,
        {
          email: inviteEmail,
          role: inviteRole,
          permissions: selectedPermissions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      setSelectedPermissions({
        canManageJobs: false,
        canManageEvents: false,
        canManageTeam: false,
        canViewAnalytics: false,
        canManageApplications: false,
        canPostJobs: false,
        canPostEvents: false,
        canEditJobs: false,
        canEditEvents: false,
        canDeleteJobs: false,
        canDeleteEvents: false,
        canRespondToApplications: false
      });
      fetchOrganizationData();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error(error.response?.data?.error || 'Failed to invite member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/organizations/${organization.id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Member removed successfully!');
      fetchOrganizationData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'gold';
      case 'admin': return 'blue';
      case 'manager': return 'green';
      case 'member': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'inactive': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/organizations`,
        { name: newOrgName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success('Organization created successfully!');
        setShowCreateForm(false);
        setNewOrgName('');
        fetchOrganizationData();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(error.response?.data?.error || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  if (!organization) {
    return (
      <div style={{ padding: '2rem', color: '#fff' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '3rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ color: '#FFD600', marginBottom: '1rem' }}>No Organization Found</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
            Create an organization to manage team members, collaborate with colleagues, and streamline your recruitment process.
          </p>

          {!showCreateForm ? (
            <>
              <button 
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#FFD600',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = '#FFC107'}
                onMouseOut={(e) => e.target.style.background = '#FFD600'}
              >
                Create Organization
              </button>
              <p style={{ 
                marginTop: '1.5rem', 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.5)' 
              }}>
                Note: You can still create jobs and internships without an organization
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#FFD600',
                fontWeight: '600'
              }}>
                Organization Name *
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter your organization name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateOrganization()}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleCreateOrganization}
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: creating ? 'rgba(255, 214, 0, 0.5)' : '#FFD600',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewOrgName('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="team-management-container">
      <div className="team-header">
        <div className="team-header-content">
          <h2>Team Management</h2>
          <p>
            Manage your organization members and their permissions
          </p>
        </div>
        <button className="btn-invite" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-info">
              <div className="member-avatar">
                {member.user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="member-details">
                <h4 className="member-name">{member.user?.fullName || 'Unknown'}</h4>
                <p className="member-email">{member.user?.email}</p>
                {member.user?.headline && (
                  <p className="member-headline">{member.user.headline}</p>
                )}
                {member.status === 'pending' && (
                  <p className="member-status-pending">
                    ⏳ Invitation sent - waiting for acceptance
                  </p>
                )}
              </div>
            </div>
            <div className="member-actions">
              <span className={`role-badge ${member.role}`}>
                {member.role}
              </span>
              {/* Show delete button only if:
                  1. Current user is owner/admin
                  2. Member is not owner
                  3. Current user has permission to manage team
                  4. Not trying to delete themselves
              */}
              {member.role !== 'owner' && 
               member.user?.id !== authUser?.id &&
               (authUser?.role === 'owner' || 
                authUser?.role === 'admin' || 
                authUser?.permissions?.canManageTeam) && (
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveMember(member.id)}
                  title={member.status === 'pending' ? 'Cancel invitation' : 'Remove member'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Team Member</h3>
              <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Permissions</label>
              <div className="permissions-grid">
                {Object.keys(selectedPermissions).map((permission) => (
                  <div key={permission} className="permission-item">
                    <input
                      type="checkbox"
                      id={permission}
                      checked={selectedPermissions[permission]}
                      onChange={(e) =>
                        setSelectedPermissions({
                          ...selectedPermissions,
                          [permission]: e.target.checked
                        })
                      }
                    />
                    <label htmlFor={permission}>
                      {permission.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInviteMember}>
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementTab;
