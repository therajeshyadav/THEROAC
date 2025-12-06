import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, X, Edit2, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import './TalentPipelineTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STAGES = [
  { value: 'prospect', label: 'Prospect', color: '#6366f1' },
  { value: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { value: 'interested', label: 'Interested', color: '#ec4899' },
  { value: 'qualified', label: 'Qualified', color: '#f59e0b' },
  { value: 'ready-to-hire', label: 'Ready to Hire', color: '#10b981' }
];

const TalentPipelineTab = ({ authUser, setTalentTabLoading }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPipelineData();
    fetchStats();
  }, [selectedStage, searchQuery]);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      if (setTalentTabLoading) setTalentTabLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedStage) params.append('stage', selectedStage);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`${API_URL}/talent-pipeline?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
    } finally {
      setLoading(false);
      if (setTalentTabLoading) setTalentTabLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/talent-pipeline/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/talent-pipeline/${candidateId}`, 
        { stage: newStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPipelineData();
      fetchStats();
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage');
    }
  };

  const handleRemoveCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to remove this candidate from the pipeline?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/talent-pipeline/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPipelineData();
      fetchStats();
    } catch (error) {
      console.error('Error removing candidate:', error);
      alert('Failed to remove candidate');
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };



  return (
    <div className="talent-pipeline-tab">
      <div className="pipeline-header">
        <div className="header-top">
          <div className="header-title">
            <Users size={28} />
            <div>
              <h1>Talent Pipeline</h1>
              <p>Build and manage your talent pool</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="pipeline-stats">
            <div className="stat-card">
              <div className="stat-icon-row">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-number">{stats.totalCandidates}</div>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Candidates</span>
              </div>
            </div>
            {STAGES.map(stage => (
              <div key={stage.value} className="stat-card">
                <div className="stat-icon-row">
                  <div className="stat-icon">
                    <div className="stage-dot" style={{ background: stage.color }}></div>
                  </div>
                  <div className="stat-number">{stats.byStage[stage.value] || 0}</div>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stage.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="pipeline-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="stage-filter"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="">All Stages</option>
            {STAGES.map(stage => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List */}
      <div className="pipeline-content">
        {loading ? (
          <LoadingSpinner message="Loading talent pipeline..." />
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No candidates in pipeline</h3>
            <p>Start building your talent pool by adding candidates from job applications</p>
          </div>
        ) : (
          <div className="candidates-table">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Desired Role</th>
                  <th>Skills</th>
                  <th>Stage</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td>
                      <div className="candidate-name-cell">
                        <div className="candidate-avatar-small">
                          {candidate.candidate?.profilePicture ? (
                            <img src={candidate.candidate.profilePicture} alt={candidate.candidate.fullName} />
                          ) : (
                            <div className="avatar-placeholder-small">
                              {candidate.candidate?.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <span>{candidate.candidate?.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        {candidate.candidate?.email && (
                          <div className="contact-row">
                            <Mail size={12} />
                            <span>{candidate.candidate.email}</span>
                          </div>
                        )}
                        {candidate.candidate?.phone && (
                          <div className="contact-row">
                            <Phone size={12} />
                            <span>{candidate.candidate.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{candidate.desiredRole || '-'}</td>
                    <td>
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="skills-cell">
                          {candidate.skills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="skill-badge">{skill}</span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="skill-badge more">+{candidate.skills.length - 2}</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <select
                        className="stage-select-table"
                        value={candidate.stage}
                        onChange={(e) => handleStageChange(candidate.id, e.target.value)}
                      >
                        {STAGES.map(stage => (
                          <option key={stage.value} value={stage.value}>{stage.label}</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {candidate.source ? (
                        <span className="source-badge-table">{candidate.source}</span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="action-buttons-table">
                        <button
                          className="action-btn-table view"
                          onClick={() => handleViewDetails(candidate)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn-table delete"
                          onClick={() => handleRemoveCandidate(candidate.id)}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="talent-pipeline-modal-wrapper">
          <CandidateDetailsModal
            candidate={selectedCandidate}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedCandidate(null);
            }}
            onUpdate={fetchPipelineData}
          />
        </div>
      )}
    </div>
  );
};

// Candidate Details Modal Component
const CandidateDetailsModal = ({ candidate, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    notes: candidate.notes || '',
    stage: candidate.stage,
    desiredRole: candidate.desiredRole || '',
    experience: candidate.experience || '',
    availability: candidate.availability || ''
  });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/talent-pipeline/${candidate.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content candidate-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Candidate Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="candidate-profile">
            <div className="profile-avatar">
              {candidate.candidate?.profilePicture ? (
                <img src={candidate.candidate.profilePicture} alt={candidate.candidate.fullName} />
              ) : (
                <div className="avatar-placeholder-large">
                  {candidate.candidate?.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{candidate.candidate?.fullName}</h3>
              <p>{candidate.candidate?.email}</p>
              {candidate.candidate?.phone && <p>{candidate.candidate.phone}</p>}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Stage</label>
              {isEditing ? (
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  {STAGES.map(stage => (
                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
              ) : (
                <span className="stage-badge" style={{ 
                  background: `${STAGES.find(s => s.value === candidate.stage)?.color}20`,
                  color: STAGES.find(s => s.value === candidate.stage)?.color
                }}>
                  {STAGES.find(s => s.value === candidate.stage)?.label}
                </span>
              )}
            </div>



            <div className="detail-item full-width">
              <label>Desired Role</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.desiredRole}
                  onChange={(e) => setFormData({ ...formData, desiredRole: e.target.value })}
                  placeholder="e.g., Senior Developer"
                />
              ) : (
                <span>{candidate.desiredRole || 'Not specified'}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Experience</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 5 years"
                />
              ) : (
                <span>{candidate.experience || 'Not specified'}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Availability</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g., Immediate"
                />
              ) : (
                <span>{candidate.availability || 'Not specified'}</span>
              )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="detail-item full-width">
                <label>Skills</label>
                <div className="skills-list">
                  {candidate.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-item full-width">
              <label>Notes</label>
              {isEditing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes about this candidate..."
                  rows={4}
                />
              ) : (
                <p className="notes-text">{candidate.notes || 'No notes'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn-primary" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} />
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentPipelineTab;
