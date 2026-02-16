import React, { useState, useEffect } from 'react';
import { Link2, Plus, Settings, Lock, User, Mail, Phone, FileText, Users, Building, MapPin, Accessibility } from 'lucide-react';
import '../StepStyles.css';

const ApplicationStep = ({ formData, setFormData, contentType }) => {
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [expandedSuggestions, setExpandedSuggestions] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Application Form Fields with lucide-react icons
  const defaultFormFields = [
    { id: 'name', label: 'Name', required: true, locked: true, icon: User },
    { id: 'email', label: 'Email', required: true, locked: true, icon: Mail },
    { id: 'mobile', label: 'Mobile number', required: true, locked: false, icon: Phone },
    { id: 'resume', label: 'CV/Resume', required: true, locked: false, icon: FileText },
    { id: 'gender', label: 'Gender', required: true, locked: false, icon: Users },
    { id: 'college', label: 'Current College/Organization', required: true, locked: false, icon: Building },
    { id: 'userType', label: 'User Type', required: true, locked: false, icon: User },
    { id: 'location', label: "Applicant's location", required: true, locked: false, icon: MapPin },
    { id: 'differently', label: 'Differently abled', required: true, locked: false, icon: Accessibility },
  ];

  // Initialize form fields if not present
  useEffect(() => {
    if (!formData.applicationFormFields || formData.applicationFormFields.length === 0) {
      setFormData({ ...formData, applicationFormFields: defaultFormFields });
    }
  }, []);

  // Auto-set registration timeline: listing creation date to 15 days from creation
  useEffect(() => {
    if (!formData.applicationStartDate || !formData.applicationEndDate) {
      // Use listing creation date if available (for edit), otherwise use current date (for new listing)
      const baseDate = formData.createdAt ? new Date(formData.createdAt) : new Date();
      const startDate = new Date(baseDate);
      const endDate = new Date(baseDate);
      endDate.setDate(endDate.getDate() + 15); // 15 days from listing creation date
      
      // Format to datetime-local format (YYYY-MM-DDTHH:MM)
      const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      if (!formData.applicationStartDate) {
        handleChange('applicationStartDate', formatDateTime(startDate));
      }
      if (!formData.applicationEndDate) {
        handleChange('applicationEndDate', formatDateTime(endDate));
      }
    }
  }, [formData.createdAt]); // Re-run when createdAt is available

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  const isOpportunity = contentType === 'opportunity';
  const title = isOpportunity ? 'Registration Settings' : 'Application Settings';
  const description = 'Manage the candidate application experience, application status, limits, and timelines.';

  const suggestedQuestions = [
    'Cover Letter', 'Expected Salary', 'Highest Qualification',
    'Preferred Work Location', 'Joining Timeline', 'Notice Period',
    'Portfolio/Work Samples', 'Willingness to Relocate'
  ];

  const toggleFormField = (fieldId) => {
    const currentFields = formData.applicationFormFields || defaultFormFields;
    const updatedFields = currentFields.map(field => 
      field.id === fieldId && !field.locked
        ? { ...field, required: !field.required }
        : field
    );
    handleChange('applicationFormFields', updatedFields);
  };

  const addScreeningQuestion = (question) => {
    const current = formData.screeningQuestions || [];
    if (!current.includes(question)) {
      handleChange('screeningQuestions', [...current, question]);
    }
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim()) {
      const current = formData.screeningQuestions || [];
      if (!current.includes(customQuestion.trim())) {
        handleChange('screeningQuestions', [...current, customQuestion.trim()]);
      }
      setCustomQuestion('');
      setShowAddQuestionModal(false);
    }
  };

  const removeScreeningQuestion = (question) => {
    const current = formData.screeningQuestions || [];
    handleChange('screeningQuestions', current.filter(q => q !== question));
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">{title}</h2>
        <p className="unified-step-description">{description}</p>
      </div>

      <div className="unified-form-grid">
        {/* Application Configuration Section */}
        <div className="unified-form-group unified-full-width">
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1.5rem', marginTop: '0' }}>
            Application Configuration
          </h3>
        </div>

        {/* Platform */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Platform</label>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                This {isOpportunity ? 'opportunity' : 'internship'} is set to receive applications on{' '}
                <span style={{ color: '#FFD600', fontWeight: '600' }}>
                  {formData.applicationPlatform || 'ROAC'}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPlatformModal(true)}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid #FFD600',
                borderRadius: '6px',
                color: '#FFD600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Link2 size={14} /> Change
            </button>
          </div>
        </div>

        {/* Registration Timeline */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Registration Timeline</label>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Applications will be open from{' '}
                <span style={{ color: '#fff', fontWeight: '600' }}>
                  {formatDisplayDate(formData.applicationStartDate)}
                </span>
                {' '}to{' '}
                <span style={{ color: '#fff', fontWeight: '600' }}>
                  {formatDisplayDate(formData.applicationEndDate)}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTimelineModal(true)}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid #FFD600',
                borderRadius: '6px',
                color: '#FFD600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Link2 size={14} /> Change
            </button>
          </div>
        </div>

        {/* Maximum Application Limit */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Maximum Application Limit</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
            You can set a maximum number of applications after which applications will automatically close.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="number"
              className="unified-form-input"
              placeholder="Enter limit"
              value={formData.maxApplications || ''}
              onChange={(e) => handleChange('maxApplications', e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <button
              type="button"
              onClick={() => handleChange('maxApplications', '')}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              No limit ∞
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Status</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
            Set the application status <span style={{ fontWeight: '600' }}>OPEN</span> to accept applications & <span style={{ fontWeight: '600' }}>CLOSE</span> to restrict new ones.
          </p>
          <div className="unified-radio-group">
            <div 
              className={`unified-radio-option ${formData.applicationStatus === 'open' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('applicationStatus', 'open')}
            >
              <input
                type="radio"
                name="applicationStatus"
                className="unified-radio-input"
                checked={formData.applicationStatus === 'open'}
                readOnly
              />
              <label className="unified-radio-label">
                <span style={{ color: '#4CAF50' }}>●</span> Open
              </label>
            </div>
            <div 
              className={`unified-radio-option ${formData.applicationStatus === 'closed' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('applicationStatus', 'closed')}
            >
              <input
                type="radio"
                name="applicationStatus"
                className="unified-radio-input"
                checked={formData.applicationStatus === 'closed'}
                readOnly
              />
              <label className="unified-radio-label">
                <span style={{ color: '#FF4444' }}>●</span> Closed
              </label>
            </div>
          </div>
        </div>

        {/* Application Form Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
            Application Form
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
            Customize the form applicants fill out when applying for this role.
          </p>
        </div>

        {/* Form Fields List */}
        <div className="unified-form-group unified-full-width">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            marginTop: '1rem'
          }}>
            {(formData.applicationFormFields || defaultFormFields).map((field) => {
              const IconComponent = field.icon || User;
              return (
                <div 
                  key={field.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <IconComponent size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <span style={{ color: '#fff', fontSize: '0.95rem' }}>{field.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: field.required ? '#FFD600' : 'rgba(255, 255, 255, 0.5)' 
                    }}>
                      {field.required ? 'Required' : 'Optional'}
                    </span>
                    {field.locked ? (
                      <Lock size={16} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleFormField(field.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Toggle Required/Optional"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Screening Questions Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0 }}>
              Screening Questions/Additional Info
            </h3>
            <button
              type="button"
              onClick={() => setShowAddQuestionModal(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 214, 0, 0.1)',
                border: '1px solid #FFD600',
                color: '#FFD600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
            Add custom questions in application form and use response to shortlist applicants
          </p>

          {/* Suggested Questions */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setExpandedSuggestions(!expandedSuggestions)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <span>{expandedSuggestions ? '▼' : '▶'}</span>
              Suggested screening question(s)
            </button>

            {expandedSuggestions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => addScreeningQuestion(question)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Plus size={14} /> {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Questions */}
          {(formData.screeningQuestions || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {formData.screeningQuestions.map((question) => (
                <div
                  key={question}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 214, 0, 0.1)',
                    border: '1px solid #FFD600',
                    borderRadius: '20px',
                    color: '#FFD600',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {question}
                  <button
                    type="button"
                    onClick={() => removeScreeningQuestion(question)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFD600',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: 0,
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Modal */}
      {showPlatformModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowPlatformModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="rounds-modal-header">
              <h3>Select Platform</h3>
              <button className="rounds-modal-close" onClick={() => setShowPlatformModal(false)}>×</button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-radio-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                {['ROAC', 'Other platform'].map((platform) => (
                  <div 
                    key={platform}
                    className={`unified-radio-option ${formData.applicationPlatform === platform ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('applicationPlatform', platform)}
                  >
                    <input
                      type="radio"
                      name="platform"
                      className="unified-radio-input"
                      checked={formData.applicationPlatform === platform}
                      readOnly
                    />
                    <label className="unified-radio-label">{platform}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-primary" onClick={() => setShowPlatformModal(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowTimelineModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>Registration Timeline</h3>
              <button className="rounds-modal-close" onClick={() => setShowTimelineModal(false)}>×</button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="unified-form-input"
                  value={formData.applicationStartDate || ''}
                  onChange={(e) => handleChange('applicationStartDate', e.target.value)}
                />
              </div>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">End Date & Time</label>
                <input
                  type="datetime-local"
                  className="unified-form-input"
                  value={formData.applicationEndDate || ''}
                  onChange={(e) => handleChange('applicationEndDate', e.target.value)}
                />
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-secondary" onClick={() => setShowTimelineModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowTimelineModal(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {showAddQuestionModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowAddQuestionModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>Add Custom Question</h3>
              <button className="rounds-modal-close" onClick={() => setShowAddQuestionModal(false)}>×</button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Question</label>
                <textarea
                  className="unified-form-textarea"
                  placeholder="Enter your custom screening question..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  rows={4}
                  autoFocus
                />
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-secondary" onClick={() => {
                setCustomQuestion('');
                setShowAddQuestionModal(false);
              }}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={addCustomQuestion}
                disabled={!customQuestion.trim()}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStep;
