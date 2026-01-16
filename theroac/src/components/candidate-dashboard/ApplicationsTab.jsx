import { useState, useMemo } from 'react';
import { ExternalLink, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ApplicationsTab = ({ applications, getStatusColor, onViewJobDetails, refreshApplications }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [submissionModal, setSubmissionModal] = useState(null); // {applicationId, stageIndex, stage}
  const [submissionData, setSubmissionData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('jobs'); // 'jobs' or 'events'

  // Separate applications by type for counts
  const jobAndInternshipApplications = useMemo(() => {
    return applications.filter(app => 
      app.applicationType === 'job' || app.applicationType === 'internship'
    );
  }, [applications]);

  const eventApplications = useMemo(() => {
    return applications.filter(app => 
      app.applicationType === 'event'
    );
  }, [applications]);

  // Filter applications based on active section
  const sectionFilteredApplications = useMemo(() => {
    if (activeSection === 'jobs') {
      return applications.filter(app => 
        app.applicationType === 'job' || app.applicationType === 'internship'
      );
    } else {
      return applications.filter(app => 
        app.applicationType === 'event'
      );
    }
  }, [applications, activeSection]);

  // Calculate status counts based on current section
  const statusCounts = useMemo(() => {
    const counts = {
      all: sectionFilteredApplications.length,
      applied: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      finalized: 0,
      accepted: 0,
      rejected: 0,
      registered: 0 // For events
    };

    sectionFilteredApplications.forEach(app => {
      const status = app.status?.toLowerCase() || 'pending';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
      // Count registered events as applied for general stats
      if (status === 'registered') {
        counts.applied++;
      }
      // Count hired and offered as finalized
      if (status === 'hired' || status === 'offered') {
        counts.finalized++;
      }
    });

    return counts;
  }, [sectionFilteredApplications]);

  // Filter and sort applications based on current section
  const filteredApplications = useMemo(() => {
    let filtered = [...sectionFilteredApplications];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(app => {
        const status = app.status?.toLowerCase();
        if (activeFilter === 'applied') {
          // Include both applied and registered statuses
          return status === 'applied' || status === 'registered' || status === 'pending';
        }
        if (activeFilter === 'finalized') {
          // Include hired and offered statuses
          return status === 'hired' || status === 'offered';
        }
        return status === activeFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        // Handle job, internship, and event applications
        const itemData = app.item || app.job || app.Job || app.hubContent || app.event || {};
        return (
          itemData.title?.toLowerCase().includes(searchLower) ||
          itemData.companyName?.toLowerCase().includes(searchLower) ||
          itemData.company?.toLowerCase().includes(searchLower) ||
          itemData.organizer?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'company':
          const companyA = (a.item?.companyName || a.job?.companyName || a.Job?.companyName || a.hubContent?.companyName || a.event?.organizer || a.item?.company || '').toLowerCase();
          const companyB = (b.item?.companyName || b.job?.companyName || b.Job?.companyName || b.hubContent?.companyName || b.event?.organizer || b.item?.company || '').toLowerCase();
          return companyA.localeCompare(companyB);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [sectionFilteredApplications, activeFilter, searchTerm, sortBy]);

  // Get current stage for application
  const getCurrentStage = (app) => {
    // Handle job, internship, and event applications
    const itemData = app.item || app.job || app.Job || app.hubContent || app.event || {};
    const stages = itemData.stages || [];
    
    // If no stages defined, return null
    if (!stages || stages.length === 0) return null;
    
    // Get current stage index (default to 0 if not set)
    const currentStageIndex = app.currentStage !== undefined ? app.currentStage : 0;
    
    // Return the stage at current index
    return stages[currentStageIndex] || null;
  };

  // Check if candidate has submitted for current stage
  const hasSubmittedForStage = (app, stageIndex) => {
    if (!app.stageSubmissions || !Array.isArray(app.stageSubmissions)) return false;
    return app.stageSubmissions.some(sub => sub.stageIndex === stageIndex);
  };

  // Handle submission
  const handleSubmit = (applicationId, stageIndex) => {
    const app = applications.find(a => a.id === applicationId);
    const stage = getCurrentStage(app);
    setSubmissionModal({ applicationId, stageIndex, stage });
    setSubmissionData({}); // Reset form
  };

  // Handle form input change
  const handleSubmissionChange = (fieldName, value) => {
    setSubmissionData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Submit assessment
  const submitAssessment = async () => {
    if (!submissionModal) return;

    try {
      setSubmitting(true);

      // Validate required fields
      const stage = submissionModal.stage;
      if (stage?.submissions) {
        for (const sub of stage.submissions) {
          if (sub.required && !submissionData[sub.label]) {
            toast.error(`${sub.label} is required`);
            setSubmitting(false);
            return;
          }
        }
      }

      // Determine the correct endpoint based on application type
      const app = applications.find(a => a.id === submissionModal.applicationId);
      const applicationType = app?.applicationType || 'job';
      
      let endpoint;
      switch(applicationType) {
        case 'internship':
          endpoint = `${API_URL}/hub-content/applications/${submissionModal.applicationId}/submit-stage`;
          break;
        case 'event':
          endpoint = `${API_URL}/events/applications/${submissionModal.applicationId}/submit-stage`;
          break;
        default: // job
          endpoint = `${API_URL}/jobs/applications/${submissionModal.applicationId}/submit-stage`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          stageIndex: submissionModal.stageIndex,
          submissions: submissionData
        })
      });

      if (response.ok) {
        toast.success('Assessment submitted successfully!');
        setSubmissionModal(null);
        setSubmissionData({});
        if (refreshApplications) refreshApplications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Render application item component
  const renderApplicationItem = (app) => {
    // Handle job, internship, and event applications
    const itemData = app.item || app.job || app.Job || app.hubContent || app.event || null;
    const applicationType = app.applicationType || 'job';

    const itemForUrl = itemData
      ? itemData.companyName || itemData.organizer
        ? itemData
        : { ...itemData, companyName: itemData.company || itemData.companyName || itemData.organizer }
      : null;

    const currentStage = getCurrentStage(app);
    const isShortlisted = app.status?.toLowerCase() === 'shortlisted';
    const hasStages = currentStage !== null;
    const hasSubmitted = currentStage ? hasSubmittedForStage(app, app.currentStage || 0) : false;

    // Get appropriate icon and display text
    const getTypeInfo = (type) => {
      switch(type) {
        case 'job': return { icon: 'fa-briefcase', label: 'Job' };
        case 'internship': return { icon: 'fa-graduation-cap', label: 'Internship' };
        case 'event': return { icon: 'fa-calendar-alt', label: 'Event' };
        default: return { icon: 'fa-briefcase', label: 'Job' };
      }
    };

    const typeInfo = getTypeInfo(applicationType);

    return (
      <div key={app.id} className="application-detailed-item">
        <div className="application-content">
          <div className="application-main">
            <h5>{itemData?.title || 'Title'}</h5>
            <p className="company-name">
              {itemData?.companyName || itemData?.company || itemData?.organizer || 'Organization'}
            </p>
            <div className="application-meta">
              <span className={`type-badge ${applicationType}`}>
                <i className={`fas ${typeInfo.icon}`} />
                {typeInfo.label}
              </span>
              {hasStages && currentStage && (
                <span className="stage-badge">
                  <i className="fas fa-layer-group" /> {currentStage.title}
                </span>
              )}
              {/* Show interview date/time for interview stages */}
              {hasStages && currentStage?.type === 'interview' && currentStage?.interviewDate && (
                <span className="interview-info-badge">
                  <i className="fas fa-video" /> 
                  {new Date(currentStage.interviewDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {currentStage.interviewTime && ` at ${currentStage.interviewTime}`}
                  {currentStage.interviewDuration && ` (${currentStage.interviewDuration} min)`}
                </span>
              )}
              {applicationType === 'event' && itemData?.startDate && (
                <span className="event-date-badge">
                  <i className="fas fa-clock" /> 
                  {new Date(itemData.startDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons - Order: Assessment Link, Submit, View Details */}
          <div className="application-actions">
            {/* Interview Link - Show only on interview date */}
            {isShortlisted && hasStages && currentStage?.type === 'interview' && currentStage?.interviewLink && (() => {
              // Check if today is the interview date
              if (!currentStage.interviewDate) return false;
              
              const today = new Date();
              const interviewDate = new Date(currentStage.interviewDate);
              
              // Compare dates (ignore time)
              const isSameDay = today.getFullYear() === interviewDate.getFullYear() &&
                                today.getMonth() === interviewDate.getMonth() &&
                                today.getDate() === interviewDate.getDate();
              
              return isSameDay;
            })() && (
              <a 
                href={currentStage.interviewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-interview-link"
              >
                <ExternalLink size={16} />
                Join Interview
              </a>
            )}
            
            {/* Assessment Link - Show when shortlisted and has assessment link */}
            {isShortlisted && hasStages && currentStage?.type === 'assessment' && currentStage?.assessmentLink && (
              <a 
                href={currentStage.assessmentLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-assessment-link"
              >
                <ExternalLink size={16} />
                Assessment Link
              </a>
            )}
            
            {/* Submit Button - Show only for assessment stages when shortlisted */}
            {isShortlisted && hasStages && currentStage?.type === 'assessment' && (
              hasSubmitted ? (
                <button className="btn-submitted" disabled>
                  <CheckCircle size={16} />
                  Submitted
                </button>
              ) : (
                <button 
                  className="btn-submit"
                  onClick={() => handleSubmit(app.id, app.currentStage || 0)}
                >
                  <Upload size={16} />
                  Submit Assessment
                </button>
              )
            )}
            
            {/* View Details - Always show */}
            <button
              className="btn-secondary"
              onClick={() => {
                if (itemForUrl) {
                  onViewJobDetails(itemForUrl);
                }
              }}
            >
              View Details
            </button>
          </div>
          
          {/* Show status badge with applied date - Last */}
          <div className="application-status">
            <span>
              <i className="fas fa-calendar" /> {applicationType === 'event' ? 'Registered' : 'Applied'}: {new Date(app.createdAt).toLocaleDateString()}
            </span>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(app.status) }}
            >
              {app.status || 'Pending'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i className="fas fa-file-alt" style={{ marginRight: '8px', color: '#FFD600' }}></i>
            My Applications
          </h4>
          <div className="header-actions">
            <span className="application-count">
              {jobAndInternshipApplications.length + eventApplications.length} total applications
            </span>
          </div>
        </div>

        {/* Section Toggle Tabs */}
        <div className="section-toggle-tabs">
          <button 
            className={`section-tab ${activeSection === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveSection('jobs')}
          >
            <i className="fas fa-briefcase" />
            Jobs & Internships ({jobAndInternshipApplications.length})
          </button>
          <button 
            className={`section-tab ${activeSection === 'events' ? 'active' : ''}`}
            onClick={() => setActiveSection('events')}
          >
            <i className="fas fa-calendar-alt" />
            Events ({eventApplications.length})
          </button>
        </div>

        {/* Search and Sort */}
        <div className="application-filters">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search search-icon" />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company A-Z</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary w-100">
                <i className="fas fa-download" /> Export
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({statusCounts.all})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'applied' ? 'active' : ''}`}
              onClick={() => setActiveFilter('applied')}
            >
              Applied ({statusCounts.applied})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'reviewing' ? 'active' : ''}`}
              onClick={() => setActiveFilter('reviewing')}
            >
              Reviewing ({statusCounts.reviewing})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'shortlisted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('shortlisted')}
            >
              Shortlisted ({statusCounts.shortlisted})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'interview' ? 'active' : ''}`}
              onClick={() => setActiveFilter('interview')}
            >
              Interview ({statusCounts.interview})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'finalized' ? 'active' : ''}`}
              onClick={() => setActiveFilter('finalized')}
            >
              Finalized ({statusCounts.finalized || 0})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected ({statusCounts.rejected})
            </button>
          </div>
        </div>

        <div className="applications-detailed">
          {filteredApplications.length > 0 ? (
            <div className="applications-list">
              {filteredApplications.map(renderApplicationItem)}
            </div>
          ) : (
            <div className="no-data">
              <i className={`fas ${activeSection === 'jobs' ? 'fa-briefcase' : 'fa-calendar-alt'}`} 
                 style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <h5>
                {activeSection === 'jobs' ? 'No Job or Internship Applications' : 'No Event Registrations'}
              </h5>
              <p>
                {searchTerm || activeFilter !== 'all' 
                  ? `No ${activeSection === 'jobs' ? 'job or internship applications' : 'event registrations'} match your filters.`
                  : `You haven't ${activeSection === 'jobs' ? 'applied to any jobs or internships' : 'registered for any events'} yet.`}
              </p>
              {(searchTerm || activeFilter !== 'all') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {submissionModal && (
        <div className="submission-modal-overlay" onClick={() => setSubmissionModal(null)}>
          <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Submit Assessment</h4>
              <button onClick={() => setSubmissionModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-info">
                <h5>{submissionModal.stage?.title}</h5>
                {submissionModal.stage?.description && (
                  <p className="assessment-description">{submissionModal.stage?.description}</p>
                )}
                {submissionModal.stage?.deadline && (
                  <p className="deadline-info">
                    <i className="fas fa-clock"></i> 
                    Deadline: {new Date(submissionModal.stage.deadline).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              
              {submissionModal.stage?.assessmentLink && (
                <div className="assessment-link-box">
                  <label>Assessment Link:</label>
                  <a 
                    href={submissionModal.stage.assessmentLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-display"
                  >
                    <ExternalLink size={14} />
                    {submissionModal.stage.assessmentLink}
                  </a>
                </div>
              )}
              
              {/* Dynamic submission fields based on requirements */}
              {submissionModal.stage?.submissions && submissionModal.stage.submissions.length > 0 ? (
                <div className="submission-fields">
                  {submissionModal.stage.submissions.map((sub, idx) => (
                    <div key={idx} className="form-group">
                      <label>
                        {sub.label} {sub.required && <span className="required-star">*</span>}
                      </label>
                      {sub.type === 'link' ? (
                        <input 
                          type="url" 
                          className="form-control" 
                          placeholder={sub.description || `Enter ${sub.label.toLowerCase()}`}
                          value={submissionData[sub.label] || ''}
                          onChange={(e) => handleSubmissionChange(sub.label, e.target.value)}
                        />
                      ) : sub.type === 'document' ? (
                        <input 
                          type="file" 
                          className="form-control" 
                          accept=".pdf,.doc,.docx,.zip"
                          onChange={(e) => handleSubmissionChange(sub.label, e.target.files[0])}
                        />
                      ) : (
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder={sub.description || `Enter ${sub.label.toLowerCase()}`}
                          value={submissionData[sub.label] || ''}
                          onChange={(e) => handleSubmissionChange(sub.label, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Submission Link (github link )</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://github.com/user/repo..." 
                      value={submissionData.link || ''}
                      onChange={(e) => handleSubmissionChange('link', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSubmissionModal(null)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitAssessment} disabled={submitting}>
                <Upload size={16} />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
