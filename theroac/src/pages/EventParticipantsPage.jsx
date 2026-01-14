import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Download, ExternalLink, CheckCircle, User, Calendar, MapPin, Award, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import './EventParticipantsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EventParticipantsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluatingTeam, setEvaluatingTeam] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [filterStage, setFilterStage] = useState('all'); // Stage filter
  const [filterStatus, setFilterStatus] = useState('all'); // Status filter

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchEventParticipants();
    }
  }, [eventId]);

  // Helper function to determine if a stage is accessible for a team
  const isStageAccessible = (team, stageIndex) => {
    if (stageIndex === 0) return true; // First stage is always accessible
    
    // Check if previous stage was completed and team was shortlisted
    const previousStageEvaluation = team.evaluations?.find(evaluation => evaluation.stageIndex === stageIndex - 1);
    return previousStageEvaluation?.status === 'shortlisted';
  };

  // Helper function to get stage status
  const getStageStatus = (team, stage, stageIndex) => {
    const hasSubmissions = stage?.submissions && stage.submissions.length > 0;
    const evaluation = team?.evaluations?.find(evaluation => evaluation.stageIndex === stageIndex);
    
    if (evaluation) {
      return {
        status: evaluation.status,
        label: evaluation.status === 'shortlisted' ? 'Shortlisted' : 
               evaluation.status === 'rejected' ? 'Rejected' : 'Under Review',
        color: evaluation.status === 'shortlisted' ? '#4CAF50' : 
               evaluation.status === 'rejected' ? '#F44336' : '#FF9800'
      };
    }
    
    if (!isStageAccessible(team, stageIndex)) {
      return {
        status: 'locked',
        label: 'Locked',
        color: '#757575'
      };
    }
    
    if (hasSubmissions) {
      return {
        status: 'submitted',
        label: 'Submitted',
        color: '#2196F3'
      };
    }
    
    return {
      status: 'not-submitted',
      label: 'Not Submitted',
      color: '#FF5722'
    };
  };

  // Helper function to check if stage deadline has passed
  const isStageDeadlinePassed = (stage) => {
    if (!stage?.deadline) return false;
    return new Date() > new Date(stage.deadline);
  };

  // Helper function to get stage deadline status
  const getStageDeadlineStatus = (stage) => {
    if (!stage?.deadline) return { status: 'no-deadline', label: 'No Deadline', color: '#757575' };
    
    const now = new Date();
    const deadline = new Date(stage.deadline);
    const timeDiff = deadline - now;
    const hoursLeft = timeDiff / (1000 * 60 * 60);
    
    if (timeDiff < 0) {
      return { status: 'expired', label: 'Deadline Passed', color: '#F44336' };
    } else if (hoursLeft < 24) {
      return { status: 'urgent', label: `${Math.floor(hoursLeft)}h left`, color: '#FF9800' };
    } else {
      const daysLeft = Math.floor(hoursLeft / 24);
      return { status: 'active', label: `${daysLeft}d left`, color: '#4CAF50' };
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const fetchEventParticipants = async () => {
    try {
      const response = await fetch(`${API_URL}/events/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const eventParticipants = data.participants?.filter(p => p.eventId === eventId) || [];
      
      console.log('Event Participants Data:', eventParticipants);
      
      setParticipants(eventParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const teamName = participant.teamName || `Team ${participant.id?.toString().slice(-8)}` || 'Unnamed Team';
    
    // Search filter
    const matchesSearch = teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           participant.members?.some(member => 
             member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.email?.toLowerCase().includes(searchQuery.toLowerCase())
           );
    
    // Stage filter
    let matchesStage = true;
    if (filterStage !== 'all') {
      const stageIndex = parseInt(filterStage);
      const stageStatus = getStageStatus(participant, event?.stages?.[stageIndex], stageIndex);
      
      if (filterStatus === 'all') {
        matchesStage = true; // Show all teams for selected stage
      } else if (filterStatus === 'evaluated') {
        matchesStage = ['shortlisted', 'rejected'].includes(stageStatus.status);
      } else if (filterStatus === 'pending') {
        matchesStage = ['submitted', 'not-submitted'].includes(stageStatus.status);
      } else if (filterStatus === 'shortlisted') {
        matchesStage = stageStatus.status === 'shortlisted';
      } else if (filterStatus === 'rejected') {
        matchesStage = stageStatus.status === 'rejected';
      } else if (filterStatus === 'submitted') {
        matchesStage = stageStatus.status === 'submitted';
      } else if (filterStatus === 'not-submitted') {
        matchesStage = stageStatus.status === 'not-submitted';
      }
    }
    
    return matchesSearch && matchesStage;
  });

  const handleViewSubmission = (submission) => {
    if (submission.url || submission.link || submission.value) {
      const url = submission.url || submission.link || submission.value;
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Submission URL not available');
    }
  };

  const handleDownloadSubmission = async (submission) => {
    try {
      if (submission.fileUrl || submission.url || submission.value) {
        const fileUrl = submission.fileUrl || submission.url || submission.value;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = submission.fileName || submission.label || 'submission';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error('File not available for download');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleContactTeam = (team) => {
    const leaderEmail = team.leader?.email;
    if (leaderEmail) {
      const subject = encodeURIComponent(`Regarding ${event?.title || 'Event'} - Team ${team.teamName}`);
      const body = encodeURIComponent(`Dear ${team.leader?.name || 'Team Leader'},\n\nI hope this message finds you well.\n\nI am reaching out regarding your team's participation in ${event?.title || 'the event'}.\n\nBest regards,\n[Your Name]`);
      window.open(`mailto:${leaderEmail}?subject=${subject}&body=${body}`, '_blank');
    } else {
      toast.error('Team leader email not available');
    }
  };

  const handleEvaluateTeam = (team) => {
    setEvaluatingTeam(team);
    setShowEvaluationModal(true);
  };

  const handleStageEvaluation = async (teamId, stageIndex, status, feedback = '') => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/teams/${teamId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          stageIndex,
          status, // 'shortlisted', 'rejected', 'pending'
          feedback,
          evaluatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success(`Team ${status} successfully`);
        fetchEventParticipants(); // Refresh data
        setShowEvaluationModal(false);
        setEvaluatingTeam(null);
      } else {
        toast.error('Failed to evaluate team');
      }
    } catch (error) {
      console.error('Error evaluating team:', error);
      toast.error('Failed to evaluate team');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading participants...</p>
      </div>
    );
  }

  return (
    <div className="event-participants-page">
      <div className="page-header"> 
        <div className="event-header">
          <div className="event-info">
            <h1 className="event-title">{event?.title || 'Event Participants'}</h1>
            {/* <div className="event-meta">
              {event?.startDate && (
                <div className="event-date">
                  <Calendar size={16} />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {event?.location && (
                <div className="event-location">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
              )}
            </div> */}
          </div>
          
          <div className="event-stats">
            <div className="stat-card">
              <Users size={24} />
              <div className="stat-info">
                <span className="stat-value">{participants.length}</span>
                <span className="stat-label">Teams</span>
              </div>
            </div>
            <div className="stat-card">
              <User size={24} />
              <div className="stat-info">
                <span className="stat-value">
                  {participants.reduce((total, team) => total + (team.members?.length || 0), 0)}
                </span>
                <span className="stat-label">Participants</span>
              </div>
            </div>
            <div className="stat-card">
              <Award size={24} />
              <div className="stat-info">
                <span className="stat-value">{event?.stages?.length || 0}</span>
                <span className="stat-label">Stages</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="participants-content">
        <div className="content-header">
          <div className="search-section">
            {/* <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search teams or participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
          </div>
          
          {/* Stage and Status Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Filter by Stage:</label>
              <select 
                value={filterStage} 
                onChange={(e) => {
                  setFilterStage(e.target.value);
                  setFilterStatus('all'); // Reset status filter when stage changes
                }}
                className="filter-select"
              >
                <option value="all">All Stages</option>
                {(event?.stages || []).map((stage, index) => (
                  <option key={index} value={index}>
                    {stage.title || `Stage ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="evaluated">Evaluated</option>
                <option value="pending">Pending Evaluation</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Not Submitted</option>
              </select>
            </div>
            
            {filterStage !== 'all' && (
              <div className="stage-deadline-info">
                {(() => {
                  const stageIndex = parseInt(filterStage);
                  const stage = event?.stages?.[stageIndex];
                  const deadlineStatus = getStageDeadlineStatus(stage);
                  
                  return (
                    <div className="deadline-badge" style={{ backgroundColor: deadlineStatus.color + '20', color: deadlineStatus.color }}>
                      <Calendar size={14} />
                      <span>{deadlineStatus.label}</span>
                      {stage?.deadline && (
                        <span className="deadline-date">
                          ({new Date(stage.deadline).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* Filter Results Summary */}
          {/* <div className="filter-summary">
            <span>
              Showing {filteredParticipants.length} of {participants.length} teams
              {filterStage !== 'all' && ` for ${event?.stages?.[parseInt(filterStage)]?.title || `Stage ${parseInt(filterStage) + 1}`}`}
              {filterStatus !== 'all' && ` with status: ${filterStatus}`}
            </span>
          </div> */}
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="empty-state">
            <Users size={64} style={{ opacity: 0.3 }} />
            <h3>No participants found</h3>
            <p>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'No teams have registered for this event yet'
              }
            </p>
          </div>
        ) : (
          <div className="teams-grid">
            {filteredParticipants.map(team => (
              <div key={team.id} className="team-card">
                <div className="team-header">
                  <div className="team-info">
                    <h3 className="team-name">
                      {team.teamName || `Team ${team.id?.toString().slice(-8)}` || 'Unnamed Team'}
                    </h3>
                    <div className="event-badge">
                      <div className={`event-type type-${team.eventCategory || 'other'}`}>
                        {team.eventCategory || team.eventType || 'Event'}
                      </div>
                      <div className="event-name">{team.eventTitle}</div>
                    </div>
                  </div>
                </div>

                <div className="team-members">
                  <div className="members-header">
                    <Users size={16} />
                    <span>{team.members?.length || 0} Members</span>
                  </div>
                  <div className="members-list">
                    {team.members?.slice(0, 3).map((member, index) => (
                      <div key={index} className="member-chip">
                        <div className="member-avatar">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div className="member-details">
                          <div className="member-name">{member.name}</div>
                          <div className="member-role">
                            {index === 0 ? 'Team Leader' : 'Member'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {team.members?.length > 3 && (
                      <div className="member-chip more">
                        +{team.members.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="submission-status">
                  <div className="status-header">
                    <FileText size={16} />
                    <span>Submissions ({team.submissionsCount || 0})</span>
                  </div>
                  
                  <div className="stages-status">
                    {(event?.stages || team.eventStages || []).map((stage, stageIndex) => {
                      const stageStatus = getStageStatus(team, stage, stageIndex);
                      const isAccessible = isStageAccessible(team, stageIndex);
                      const teamStage = team.eventStages?.[stageIndex];
                      
                      return (
                        <div key={stageIndex} className={`stage-item stage-${stageStatus.status}`}>
                          <div className="stage-info">
                            <div className="stage-header-info">
                              <span className="stage-name">{stage.title || `Stage ${stageIndex + 1}`}</span>
                              {stage.deadline && (
                                <span className="stage-deadline">
                                  Deadline: {new Date(stage.deadline).toLocaleDateString()}
                                  {isStageDeadlinePassed(stage) && (
                                    <span className="deadline-expired"> (Expired)</span>
                                  )}
                                </span>
                              )}
                            </div>
                            
                            {!isAccessible ? (
                              <div className="stage-locked">
                                <span>🔒 Complete previous stage to unlock</span>
                              </div>
                            ) : teamStage?.submissions && teamStage.submissions.length > 0 ? (
                              <div className="stage-files">
                                {teamStage.submissions.map((submission, subIndex) => (
                                  <div key={subIndex} className="submission-group">
                                    <div className="submission-header">
                                      <span className="submission-label">{submission.label}</span>
                                      <span className="submission-date">
                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    
                                    {/* Display files */}
                                    {submission.files && submission.files.length > 0 && (
                                      <div className="files-list">
                                        {submission.files.map((file, fileIndex) => (
                                          <div key={fileIndex} className="file-item submitted">
                                            <FileText size={14} />
                                            <span>{file.originalName || file.fileName || 'File'}</span>
                                            <div className="submission-actions">
                                              <button 
                                                className="download-btn"
                                                onClick={() => handleDownloadSubmission(file)}
                                                title="Download file"
                                              >
                                                <Download size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Display additional files (links) */}
                                    {submission.additionalFiles && submission.additionalFiles.length > 0 && (
                                      <div className="links-list">
                                        {submission.additionalFiles.map((link, linkIndex) => (
                                          <div key={linkIndex} className="file-item submitted">
                                            <ExternalLink size={14} />
                                            <span>{link.label}</span>
                                            <div className="submission-actions">
                                              <button 
                                                className="view-btn"
                                                onClick={() => handleViewSubmission(link)}
                                                title="View link"
                                              >
                                                <ExternalLink size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Display raw submission data if no files/links */}
                                    {(!submission.files || submission.files.length === 0) && 
                                     (!submission.additionalFiles || submission.additionalFiles.length === 0) && 
                                     submission.data && (
                                      <div className="raw-data">
                                        <pre>{JSON.stringify(submission.data, null, 2)}</pre>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-stage-submissions">
                                <span>{isAccessible ? 'Not Submitted' : 'Stage Locked'}</span>
                              </div>
                            )}
                          </div>
                          <div 
                            className={`stage-status ${stageStatus.status}`}
                            style={{ backgroundColor: stageStatus.color + '20', color: stageStatus.color, border: `2px solid ${stageStatus.color}40` }}
                          >
                            {stageStatus.status === 'submitted' ? <CheckCircle size={16} /> :
                             stageStatus.status === 'shortlisted' ? <CheckCircle size={16} /> :
                             stageStatus.status === 'rejected' ? '✕' :
                             stageStatus.status === 'locked' ? '🔒' :
                             '⏳'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="team-actions">
                  <button 
                    className="btn-evaluate"
                    onClick={() => handleEvaluateTeam(team)}
                  >
                    <CheckCircle size={16} />
                    Evaluate Team
                  </button>
                  <button 
                    className="btn-contact"
                    onClick={() => handleContactTeam(team)}
                    title={team.leader?.email ? `Contact: ${team.leader.email}` : 'Email not available'}
                  >
                    <User size={16} />
                    Contact Leader
                    {team.leader?.email && (
                      <span className="contact-email">{team.leader.email}</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && evaluatingTeam && (
        <div className="modal-overlay">
          <div className="modal-content evaluation-modal">
            <div className="modal-header">
              <h3>Evaluate Team: {evaluatingTeam.teamName}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEvaluationModal(false);
                  setEvaluatingTeam(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="team-summary">
                <h4>Team Members:</h4>
                <div className="members-summary">
                  {evaluatingTeam.members?.map((member, index) => (
                    <div key={index} className="member-summary">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{index === 0 ? 'Leader' : 'Member'}</span>
                      {index === 0 && member.email && (
                        <span className="member-email">{member.email}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="stages-evaluation">
                <h4>Stage Evaluations:</h4>
                {(event?.stages || []).map((stage, stageIndex) => {
                  const stageStatus = getStageStatus(evaluatingTeam, stage, stageIndex);
                  const isAccessible = isStageAccessible(evaluatingTeam, stageIndex);
                  const hasSubmissions = evaluatingTeam.eventStages?.[stageIndex]?.submissions?.length > 0;
                  
                  return (
                    <div key={stageIndex} className="stage-evaluation">
                      <div className="stage-header">
                        <h5>{stage.title || `Stage ${stageIndex + 1}`}</h5>
                        <span className={`stage-status-badge ${stageStatus.status}`}>
                          {stageStatus.label}
                        </span>
                      </div>
                      
                      {isAccessible && hasSubmissions && stageStatus.status !== 'shortlisted' && stageStatus.status !== 'rejected' && (
                        <div className="evaluation-actions">
                          <button
                            className="btn-shortlist"
                            onClick={() => handleStageEvaluation(evaluatingTeam.id, stageIndex, 'shortlisted')}
                          >
                            ✓ Shortlist for Next Stage
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleStageEvaluation(evaluatingTeam.id, stageIndex, 'rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                      
                      {!isAccessible && (
                        <p className="stage-note">Complete previous stage evaluation to unlock</p>
                      )}
                      
                      {isAccessible && !hasSubmissions && (
                        <p className="stage-note">No submissions yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventParticipantsPage;