import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import './TeamBuildingPage.css';

const TeamBuildingPage = () => {
    console.log('🚀 NEW TEAM BUILDING PAGE LOADED - NO PROJECT IDEA SECTION');
    const { eventId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [event, setEvent] = useState(location.state?.event || null);
    const [stage, setStage] = useState(location.state?.stage || null);
    
    const [teamData, setTeamData] = useState({
        teamName: '',
        description: ''
    });
    
    const [joinTeamCode, setJoinTeamCode] = useState('');
    const [currentTeam, setCurrentTeam] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!event && eventId) {
            fetchEventData();
        }
        checkExistingTeam();
    }, [eventId, event]);

    const fetchEventData = async () => {
        try {
            const eventData = await apiService.getEventById(eventId);
            setEvent(eventData);
            if (eventData.stages && eventData.stages[0]) {
                setStage(eventData.stages[0]);
            }
        } catch (error) {
            console.error('Error fetching event:', error);
        }
    };

    const checkExistingTeam = async () => {
        try {
            const teamStatus = await apiService.getEventTeamStatus(eventId);
            if (teamStatus.hasTeam) {
                setCurrentTeam(teamStatus);
            }
        } catch (error) {
            console.error('Error checking team status:', error);
        }
    };

    const validateCreateForm = () => {
        const newErrors = {};
        
        if (!teamData.teamName.trim()) {
            newErrors.teamName = 'Team name is required';
        }
        
        if (teamData.teamName.trim().length < 3) {
            newErrors.teamName = 'Team name must be at least 3 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateJoinForm = () => {
        const newErrors = {};
        
        if (!joinTeamCode.trim()) {
            newErrors.joinCode = 'Team code is required';
        }
        
        if (joinTeamCode.trim().length !== 6) {
            newErrors.joinCode = 'Team code must be 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateTeam = async () => {
        if (!validateCreateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const maxMembers = event.maxTeamSize || 4; // Use event's max team size or default to 4
            
            const response = await apiService.createEventTeam(eventId, {
                teamName: teamData.teamName.trim(),
                maxMembers: maxMembers,
                description: teamData.description.trim()
            });
            
            alert(`Team created successfully! Team Code: ${response.team.teamCode}`);
            await checkExistingTeam(); // Refresh team status
            
        } catch (error) {
            console.error('Team creation error:', error);
            alert(`Failed to create team: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinTeam = async () => {
        if (!validateJoinForm()) {
            return;
        }
        
        setIsJoining(true);
        
        try {
            const response = await apiService.joinEventTeam(eventId, joinTeamCode.trim().toUpperCase());
            
            alert(`Successfully joined team: ${response.team.name}`);
            await checkExistingTeam(); // Refresh team status
            
        } catch (error) {
            console.error('Team join error:', error);
            alert(`Failed to join team: ${error.message}`);
        } finally {
            setIsJoining(false);
        }
    };

    const copyTeamCode = () => {
        if (currentTeam?.teamCode) {
            navigator.clipboard.writeText(currentTeam.teamCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleBackToEvent = () => {
        if (event?.slug) {
            navigate(`/event-detail/events/${event.slug}`);
        } else {
            navigate(-1);
        }
    };

    if (!event) {
        return <div className="team-building-loading">Loading...</div>;
    }

    // If user already has a team, show team details
    if (currentTeam) {
        return (
            <div className="team-building-page">
                <div className="team-building-container">
                    <div className="team-building-header">
                        <div className="header-info">
                            <h1 className="page-title">Your Team</h1>
                            <p className="event-title">{event.title}</p>
                        </div>
                    </div>

                    <div className="team-details-card">
                        <div className="team-header">
                            <div className="team-info">
                                <h2 className="team-name">{currentTeam.teamName}</h2>
                                <div className="team-code-section">
                                    <span className="team-code-label">Team Code:</span>
                                    <div className="team-code-display">
                                        <span className="team-code">{currentTeam.teamCode}</span>
                                        <button 
                                            className="copy-btn"
                                            onClick={copyTeamCode}
                                            title="Copy team code"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="team-stats">
                                <span className="member-count">
                                    {currentTeam.memberCount}/{currentTeam.maxMembers} Members
                                </span>
                                {currentTeam.isLeader && (
                                    <span className="leader-badge">Team Leader</span>
                                )}
                            </div>
                        </div>

                        <div className="team-members">
                            <h3>Team Members</h3>
                            <div className="members-list">
                                {currentTeam.members?.map((member, index) => (
                                    <div key={member.id} className="member-item">
                                        <div className="member-info">
                                            <span className="member-name">{member.name}</span>
                                            <span className="member-email">{member.email}</span>
                                        </div>
                                        {member.isLeader && (
                                            <span className="member-role-badge">Leader</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="team-actions">
                            <div className={`info-message ${currentTeam.isEligibleForSubmission ? 'success' : 'warning'}`}>
                                <Users size={20} />
                                <div>
                                    <p><strong>Team Created Successfully!</strong></p>
                                    <p>Team Code: <strong>{currentTeam.teamCode}</strong></p>
                                    <p>Members: {currentTeam.memberCount}/{currentTeam.maxMembers}</p>
                                    {currentTeam.minRequiredMembers && (
                                        <p className={`eligibility-status ${currentTeam.isEligibleForSubmission ? 'eligible' : 'not-eligible'}`}>
                                            <strong>{currentTeam.eligibilityMessage}</strong>
                                        </p>
                                    )}
                                    {currentTeam.isRegistrationDeadlinePassed && !currentTeam.isEligibleForSubmission ? (
                                        <p className="deadline-passed-message">
                                            ⏰ Registration deadline has passed. Your team cannot participate as minimum members requirement was not met.
                                        </p>
                                    ) : currentTeam.isEligibleForSubmission ? (
                                        <p>Your team is ready for submissions!</p>
                                    ) : (
                                        <p>Share the team code with your teammates so they can join.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="team-building-page">
            <div className="team-building-container">
                <div className="team-building-header">
                    <div className="header-info">
                        <h1 className="page-title">Team Creation</h1>
                        <p className="event-title">{event.title}</p>
                        <p className="stage-title">{stage?.title || 'Team Registration'}</p>
                    </div>
                </div>

                <div className="team-building-content">
                    <div className="team-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                            onClick={() => setActiveTab('create')}
                        >
                            Create Team
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
                            onClick={() => setActiveTab('join')}
                        >
                            Join Team
                        </button>
                    </div>

                    {activeTab === 'create' && (
                        <div className="form-section">
                            <div className="section-header">
                                <Users size={24} />
                                <h2>Create New Team</h2>
                            </div>
                            
                            <div className="form-group">
                                <label>Team Name *</label>
                                <input
                                    type="text"
                                    value={teamData.teamName}
                                    onChange={(e) => setTeamData(prev => ({ ...prev, teamName: e.target.value }))}
                                    placeholder="Enter your team name"
                                    className={errors.teamName ? 'error' : ''}
                                />
                                {errors.teamName && <span className="error-text">{errors.teamName}</span>}
                            </div>

                            {/* Team Size Info */}
                            <div className="team-size-info">
                                <label>Team Size Requirements</label>
                                <div className="size-display">
                                    {event.minTeamSize && event.maxTeamSize ? (
                                        <span className="size-range">
                                            {event.minTeamSize === event.maxTeamSize 
                                                ? `Exactly ${event.maxTeamSize} members required`
                                                : `${event.minTeamSize} - ${event.maxTeamSize} members`
                                            }
                                        </span>
                                    ) : event.maxTeamSize ? (
                                        <span className="size-range">Maximum {event.maxTeamSize} members</span>
                                    ) : (
                                        <span className="size-range">Up to 4 members (default)</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Team Description (Optional)</label>
                                <textarea
                                    value={teamData.description}
                                    onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description about your team"
                                    rows="3"
                                />
                            </div>

                            <button 
                                className="submit-btn"
                                onClick={handleCreateTeam}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Team'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'join' && (
                        <div className="form-section">
                            <div className="section-header">
                                <Users size={24} />
                                <h2>Join Existing Team</h2>
                            </div>
                            
                            <div className="form-group">
                                <label>Team Code *</label>
                                <input
                                    type="text"
                                    value={joinTeamCode}
                                    onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character team code"
                                    maxLength={6}
                                    className={errors.joinCode ? 'error' : ''}
                                />
                                {errors.joinCode && <span className="error-text">{errors.joinCode}</span>}
                                <small className="help-text">
                                    Ask your team leader for the 6-character team code
                                </small>
                            </div>

                            <button 
                                className="submit-btn"
                                onClick={handleJoinTeam}
                                disabled={isJoining}
                            >
                                {isJoining ? 'Joining...' : 'Join Team'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamBuildingPage;