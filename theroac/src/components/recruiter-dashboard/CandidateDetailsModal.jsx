import React, { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import './CandidateDetailsModal.css';

const CandidateDetailsModal = ({ isOpen, onClose, application, onStatusUpdate }) => {
  const [status, setStatus] = useState(application?.status || 'pending');
  const [updating, setUpdating] = useState(false);
  const [addingToPipeline, setAddingToPipeline] = useState(false);

  if (!isOpen || !application) return null;

  const candidate = application.user || {};
  const job = application.job || {};
  const metadata = application.metadata || {};
  

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await apiService.updateApplicationStatus(application.id, { status });
      toast.success('Application status updated');
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToPipeline = async () => {
    setAddingToPipeline(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/talent-pipeline/from-application/${application.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stage: 'prospect',
          notes: `Added from job application for ${job.title}`
        })
      });

      if (response.ok) {
        toast.success('Candidate added to talent pipeline!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add to pipeline');
      }
    } catch (error) {
      console.error('Error adding to pipeline:', error);
      toast.error('Failed to add candidate to pipeline');
    } finally {
      setAddingToPipeline(false);
    }
  };



  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResumeUrl = (resumePath) => {
    if (!resumePath) return '';
    
    // If it's already a full URL, return as is
    if (resumePath.startsWith('http://') || resumePath.startsWith('https://')) {
      return resumePath;
    }
    
    // If it starts with /uploads, prepend the API URL
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
    const baseUrl = API_URL.replace('/api', ''); // Remove /api from the end
    
    // If path starts with /, use it directly, otherwise add /
    const path = resumePath.startsWith('/') ? resumePath : `/${resumePath}`;
    
    return `${baseUrl}${path}`;
  };

  const getStatusOptions = (applicationType) => {
    switch (applicationType) {
      case 'event':
        return [
          { value: 'registered', label: 'Registered' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'attended', label: 'Attended' },
          { value: 'no-show', label: 'No Show' },
          { value: 'cancelled', label: 'Cancelled' }
        ];
      
      case 'internship':
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'reviewing', label: 'Under Review' },
          { value: 'shortlisted', label: 'Shortlisted' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'cancelled', label: 'Cancelled' }
        ];
      
      case 'job':
      default:
        return [
          { value: 'applied', label: 'Applied' },
          { value: 'pending', label: 'Pending' },
          { value: 'reviewing', label: 'Reviewing' },
          { value: 'shortlisted', label: 'Shortlisted' },
          { value: 'interview', label: 'Interview' },
          { value: 'offered', label: 'Offered' },
          { value: 'hired', label: 'Hired' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'cancelled', label: 'Cancelled' }
        ];
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="candidate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2>Candidate Details</h2>
            <span className="application-id">Application #{application.id.slice(0, 8)}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Candidate Profile Section */}
          <div className="section candidate-profile">
            <div className="profile-header">
              <div className="profile-avatar">
                {candidate.profilePicture ? (
                  <img src={candidate.profilePicture} alt={candidate.fullName} />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <div className="profile-info">
                <h3>{candidate.fullName || 'Unknown Candidate'}</h3>
                <p className="headline">{candidate.headline || 'No headline'}</p>
                <div className="contact-info">
                  <span><i className="fas fa-envelope"></i> {candidate.email}</span>
                  {candidate.phone && <span><i className="fas fa-phone"></i> {candidate.phone}</span>}
                  {candidate.location && <span><i className="fas fa-map-marker-alt"></i> {candidate.location}</span>}
                </div>
                <div className="social-links">
                  {candidate.linkedinUrl && (
                    <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {candidate.githubUrl && (
                    <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="section application-details">
            <h4><i className="fas fa-briefcase"></i> Application Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Applied For</label>
                <p>{job.title}</p>
              </div>
              <div className="detail-item">
                <label>Applied On</label>
                <p>{formatDate(application.createdAt)}</p>
              </div>
              <div className="detail-item">
                <label>Current Status</label>
                <span className={`status-badge status-${status}`}>{status}</span>
              </div>
            </div>
          </div>

          {/* Quick Apply Form Data - Only show if there's actual data */}
          {metadata && Object.keys(metadata).length > 0 && (
            Object.values(metadata).some(val => val !== null && val !== undefined && val !== '') && (
              <div className="section form-data">
                <h4><i className="fas fa-file-alt"></i> Submitted Information</h4>
                <div className="details-grid">
                  {metadata.userType && (
                    <div className="detail-item">
                      <label>User Type</label>
                      <p>{metadata.userType}</p>
                    </div>
                  )}
                  {metadata.differentlyAbled !== undefined && (
                    <div className="detail-item">
                      <label>Differently Abled</label>
                      <p>{metadata.differentlyAbled ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {metadata.gender && (
                    <div className="detail-item">
                      <label>Gender</label>
                      <p>{metadata.gender}</p>
                    </div>
                  )}
                  {metadata.instituteName && (
                    <div className="detail-item">
                      <label>Institute</label>
                      <p>{metadata.instituteName}</p>
                    </div>
                  )}
                  {metadata.course && (
                    <div className="detail-item">
                      <label>Course</label>
                      <p>{metadata.course}</p>
                    </div>
                  )}
                  {metadata.courseSpecialization && (
                    <div className="detail-item">
                      <label>Specialization</label>
                      <p>{metadata.courseSpecialization}</p>
                    </div>
                  )}
                  {metadata.graduationYear && (
                    <div className="detail-item">
                      <label>Graduation Year</label>
                      <p>{metadata.graduationYear}</p>
                    </div>
                  )}
                  {metadata.courseDuration && (
                    <div className="detail-item">
                      <label>Course Duration</label>
                      <p>{metadata.courseDuration}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* About */}
          {candidate.about && (
            <div className="section about-section">
              <h4><i className="fas fa-user-circle"></i> About</h4>
              <p>{candidate.about}</p>
            </div>
          )}

          {/* Skills - Only show if candidate has skills */}
          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
            <div className="section skills-section">
              <h4><i className="fas fa-code"></i> Skills</h4>
              <div className="skills-list">
                {candidate.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education - Only show if candidate has education */}
          {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 && (
            <div className="section education-section">
              <h4><i className="fas fa-graduation-cap"></i> Education</h4>
              {candidate.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h5>{edu.degree || edu.course || 'Education'}</h5>
                  {edu.institute && <p className="institute">{edu.institute}</p>}
                  <p className="details">
                    {edu.specialization && <span>{edu.specialization}</span>}
                    {edu.specialization && edu.graduationYear && <span> • </span>}
                    {edu.graduationYear && <span>{edu.graduationYear}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Experience - Only show if candidate has experience */}
          {candidate.experiences && Array.isArray(candidate.experiences) && candidate.experiences.length > 0 && (
            <div className="section experience-section">
              <h4><i className="fas fa-briefcase"></i> Experience</h4>
              {candidate.experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h5>{exp.title || exp.position || 'Position'}</h5>
                  {exp.company && <p className="company">{exp.company}</p>}
                  {(exp.duration || exp.startDate) && (
                    <p className="duration">
                      {exp.duration || `${exp.startDate} - ${exp.endDate || 'Present'}`}
                    </p>
                  )}
                  {exp.description && <p className="description">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Resume - Only show if resume exists */}
          {(application.resumeLink || candidate.resumePath) && (
            <div className="section resume-section">
              <h4><i className="fas fa-file-pdf"></i> Resume</h4>
              <div className="resume-actions">
                <a 
                  href={getResumeUrl(application.resumeLink || candidate.resumePath)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resume-btn view-btn"
                >
                  <i className="fas fa-eye"></i> View Resume
                </a>
                <a 
                  href={getResumeUrl(application.resumeLink || candidate.resumePath)} 
                  download
                  className="resume-btn download-btn"
                >
                  <i className="fas fa-download"></i> Download
                </a>
              </div>
            </div>
          )}

          {/* Cover Letter - Only show if cover letter exists */}
          {application.coverLetter && application.coverLetter.trim() !== '' && (
            <div className="section cover-letter-section">
              <h4><i className="fas fa-envelope-open-text"></i> Cover Letter</h4>
              <p className="cover-letter">{application.coverLetter}</p>
            </div>
          )}

          {/* Recruiter Actions */}
          <div className="section actions-section">
            <h4><i className="fas fa-tasks"></i> Evaluation</h4>
            
            <div className="action-group">
              <label>Update Status</label>
              <div className="status-actions">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="status-select"
                >
                  {getStatusOptions(application.type).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updating || status === application.status}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            <div className="action-group">
              <label>Talent Pipeline</label>
              <button 
                className="btn-pipeline"
                onClick={handleAddToPipeline}
                disabled={addingToPipeline}
              >
                <i className="fas fa-users"></i>
                {addingToPipeline ? 'Adding...' : 'Add to Talent Pipeline'}
              </button>
              <p className="help-text">Save this candidate for future opportunities</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
