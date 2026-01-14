import { useState, useEffect } from 'react';
import { X, Download, Github, Video, FileText, ExternalLink, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import './EventSubmissionsModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const EventSubmissionsModal = ({ isOpen, onClose, team }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (isOpen && team) {
      fetchSubmissions();
    }
  }, [isOpen, team]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/${team.eventId}/teams/${team.id}/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'github-link': return <Github size={16} />;
      case 'demo-video': return <Video size={16} />;
      case 'document':
      case 'ppt': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="submissions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Team Submissions</h2>
            <p>{team?.teamName || `Team ${team?.id}`} - {team?.eventTitle}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Team Members Section */}
          <div className="team-section">
            <h3>Team Members ({team?.members?.length || 0})</h3>
            <div className="members-grid">
              {team?.members?.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-avatar">
                    {member.name?.charAt(0) || 'U'}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <div className="member-details">
                      <span><Mail size={14} /> {member.email}</span>
                      {member.phone && <span><Phone size={14} /> {member.phone}</span>}
                      {member.role && <span className="member-role">{member.role}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions Section */}
          <div className="submissions-section">
            <h3>Submissions by Stage</h3>
            
            {loading ? (
              <div className="loading-state">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} style={{ opacity: 0.3 }} />
                <p>No submissions found for this team</p>
              </div>
            ) : (
              <>
                {/* Stage Tabs */}
                <div className="stage-tabs">
                  {submissions.map((stage, index) => (
                    <button
                      key={index}
                      className={`stage-tab ${activeStage === index ? 'active' : ''}`}
                      onClick={() => setActiveStage(index)}
                    >
                      Stage {index + 1}: {stage.stageTitle}
                      <span className="files-count">({stage.files?.length || 0} files)</span>
                    </button>
                  ))}
                </div>

                {/* Active Stage Content */}
                {submissions[activeStage] && (
                  <div className="stage-content">
                    <div className="stage-info">
                      <h4>{submissions[activeStage].stageTitle}</h4>
                      <p>{submissions[activeStage].stageDescription}</p>
                      <div className="submission-meta">
                        <span>Submitted: {new Date(submissions[activeStage].submittedAt).toLocaleString()}</span>
                        <span>Status: {submissions[activeStage].status || 'Submitted'}</span>
                      </div>
                    </div>

                    {/* Files Grid */}
                    <div className="files-grid">
                      {submissions[activeStage].files?.map((file, fileIndex) => (
                        <div key={fileIndex} className="file-card">
                          <div className="file-header">
                            <div className="file-icon">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="file-info">
                              <h5>{file.label}</h5>
                              <p>{file.description}</p>
                            </div>
                          </div>
                          
                          <div className="file-content">
                            {file.type === 'github-link' ? (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                <Github size={16} />
                                View Repository
                                <ExternalLink size={14} />
                              </a>
                            ) : file.type === 'demo-video' ? (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                <Video size={16} />
                                Watch Video
                                <ExternalLink size={14} />
                              </a>
                            ) : file.type === 'link' ? (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                <ExternalLink size={16} />
                                Open Link
                              </a>
                            ) : (
                              <button 
                                className="file-download"
                                onClick={() => handleDownload(file.url, file.fileName || file.label)}
                              >
                                <Download size={16} />
                                Download File
                              </button>
                            )}
                          </div>

                          {file.submittedBy && (
                            <div className="file-meta">
                              <User size={12} />
                              Submitted by: {file.submittedBy}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {(!submissions[activeStage].files || submissions[activeStage].files.length === 0) && (
                      <div className="empty-files">
                        <FileText size={32} style={{ opacity: 0.3 }} />
                        <p>No files submitted for this stage</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSubmissionsModal;