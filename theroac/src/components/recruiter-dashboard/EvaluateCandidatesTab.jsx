import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, XCircle, Clock, User, Users, Award, Briefcase, Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import CandidateDetailsModal from './CandidateDetailsModal';
import { toast } from 'react-toastify';
import './EvaluateCandidatesTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EvaluateCandidatesTab = ({ authUser }) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('jobs'); // 'jobs' or 'events'
  const [applications, setApplications] = useState([]);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [events, setEvents] = useState([]); // User's events list
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (activeSubTab === 'jobs') {
      fetchApplications();
      fetchJobs();
    } else {
      fetchEventParticipants();
      fetchEvents();
    }
  }, [activeSubTab]);

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

  const fetchEvents = async () => {
    try {
      // Get all events with higher limit and recent first
      const response = await fetch(`${API_URL}/events?perPage=100&page=1`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      
      // Filter events by createdBy field
      let userEvents = data.filter(event => event.createdBy === authUser?.id);
      
      if (userEvents.length === 0) {
        userEvents = data.filter(event => String(event.createdBy) === String(authUser?.id));
      }
      
      setEvents(userEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Get event status based on dates and stages
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', color: '#FFA500' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'live', label: 'Live', color: '#4CAF50' };
    } else {
      // Check if any stages are still active
      if (event.stages && event.stages.length > 0) {
        const activeStage = event.stages.find(stage => {
          const stageDeadline = new Date(stage.deadline);
          return now <= stageDeadline;
        });
        
        if (activeStage) {
          return { status: 'live', label: 'Live', color: '#4CAF50' };
        }
      }
      return { status: 'ended', label: 'Ended', color: '#757575' };
    }
  };

  // Get current stage information
  const getCurrentStageInfo = (event) => {
    if (!event.stages || event.stages.length === 0) {
      return { stage: 'No stages', status: 'inactive' };
    }

    const now = new Date();
    
    // Find the current active stage
    const activeStage = event.stages.find(stage => {
      const stageDeadline = new Date(stage.deadline);
      return now <= stageDeadline;
    });

    if (activeStage) {
      return { 
        stage: activeStage.title || activeStage.name || 'Active Stage', 
        status: 'active' 
      };
    }

    // If no active stage, show the last stage
    const lastStage = event.stages[event.stages.length - 1];
    return { 
      stage: lastStage.title || lastStage.name || 'Completed', 
      status: 'completed' 
    };
  };

  // Get participant count for an event
  const getEventParticipantsCount = (eventId) => {
    return eventParticipants.filter(p => p.eventId === eventId).length;
  };

  const fetchEventParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event participants');
      }
      
      const data = await response.json();
      setEventParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching event participants:', error);
      toast.error('Failed to load event participants');
      setEventParticipants([]);
    } finally {
      setLoading(false);
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
      const transformedApplications = (data.candidates || [])
        .filter(candidate => candidate.type !== 'event') // Filter out event registrations
        .map(candidate => {
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
          <p>Review and manage applications & event participants</p>
        </div>
        <div className="stats-summary">
          {activeSubTab === 'jobs' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="stat-item">
                <span className="stat-label">Events</span>
                <span className="stat-value">{events.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Teams</span>
                <span className="stat-value">{eventParticipants.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Participants</span>
                <span className="stat-value">{eventParticipants.reduce((total, team) => total + (team.members?.length || 0), 0)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="sub-tabs">
        <button 
          className={`sub-tab ${activeSubTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('jobs')}
        >
          <Briefcase size={16} />
          Jobs & Internships
        </button>
        <button 
          className={`sub-tab ${activeSubTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('events')}
        >
          <Award size={16} />
          Events
        </button>
      </div>

      <div className="evaluate-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={activeSubTab === 'jobs' ? "Search candidates..." : "Search teams or participants..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          {activeSubTab === 'jobs' ? (
            <>
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
            </>
          ) : (
            <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {activeSubTab === 'jobs' ? (
        // Jobs & Internships Table
        filteredApplications.length === 0 ? (
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
                  <th>Position</th>
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
                         app.type === 'internship' ? 'Internship' : 'Job'}
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
        )
      ) : (
        // Events Section - Show Events List Only
        events.length === 0 ? (
          <div className="empty-state">
            <Award size={64} style={{ opacity: 0.3 }} />
            <h3>No events found</h3>
            <p>Your created events will appear here</p>
          </div>
        ) : (
          <div className="events-grid">
            {events
              .filter(event => {
                const matchesSearch = 
                  event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  event.location?.toLowerCase().includes(searchQuery.toLowerCase());
                
                const matchesEvent = filterEvent === 'all' || event.id === filterEvent;
                
                return matchesSearch && matchesEvent;
              })
              .map((event, index) => {
              try {
                const eventStatus = getEventStatus(event);
                const stageInfo = getCurrentStageInfo(event);
                const participantsCount = getEventParticipantsCount(event.id);
                
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card-header">
                      <div className="event-info">
                        <h3 className="event-title">{event.title}</h3>
                        <div className="event-meta">
                          <div className="event-date">
                            <Calendar size={14} />
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="event-location">
                            <MapPin size={14} />
                            <span>{event.location || event.locationType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="event-status-badge" style={{ backgroundColor: eventStatus.color }}>
                        {eventStatus.label}
                      </div>
                    </div>
                    
                    <div className="event-stats">
                      <div className="stat-item">
                        <Users size={16} />
                        <span>{participantsCount} Participants</span>
                      </div>
                      <div className="stat-item">
                        <Award size={16} />
                        <span>{event.stages?.length || 0} Stages</span>
                      </div>
                    </div>
                    
                    <div className="event-current-stage">
                      <span className="stage-label">Current Stage:</span>
                      <span className={`stage-info ${stageInfo.status}`}>
                        {stageInfo.stage}
                      </span>
                    </div>
                    
                    <div className="event-actions">
                      <button 
                        className="btn-view-participants"
                        onClick={() => {
                          console.log('Opening participants in new window for event:', event.id);
                          window.open(`/event-participants/${event.id}`, '_blank', 'noopener,noreferrer');
                        }}
                        disabled={participantsCount === 0}
                      >
                        <Eye size={16} />
                        View Participants ({participantsCount})
                      </button>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error('Error rendering event:', event, error);
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card-header">
                      <div className="event-info">
                        <h3 className="event-title">{event.title || 'Unknown Event'}</h3>
                        <p style={{color: 'red', fontSize: '0.8rem'}}>Error rendering event</p>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )
      )}

      <CandidateDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onStatusUpdate={activeSubTab === 'jobs' ? fetchApplications : fetchEventParticipants}
      />
    </div>
  );
};

export default EvaluateCandidatesTab;
