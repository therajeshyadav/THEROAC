import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import '../StepStyles.css';

const EligibilityStep = ({ formData, setFormData, errors }) => {
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const whoCanApplyOptions = ['Everyone can apply', 'College Students', 'Freshers', 'Professionals'];

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Eligibility</h2>
        <p className="unified-step-description">
          Set eligibility rules to ensure that only relevant candidates apply to the internship
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Who can apply? */}
        <div className="unified-form-group unified-full-width">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="unified-form-label">Who can apply?</label>
            <button 
              type="button"
              className="unified-reset-btn"
              onClick={() => handleChange('whoCanApply', 'Everyone can apply')}
            >
              ↻
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
            Select candidate type(s) who are eligible to apply for this role
          </p>
          <div className="unified-radio-group">
            {whoCanApplyOptions.map((option) => (
              <div 
                key={option}
                className={`unified-radio-option ${formData.whoCanApply === option ? 'unified-selected' : ''}`}
                onClick={() => handleChange('whoCanApply', option)}
              >
                <input
                  type="radio"
                  name="whoCanApply"
                  className="unified-radio-input"
                  checked={formData.whoCanApply === option}
                  readOnly
                />
                <label className="unified-radio-label">{option}</label>
              </div>
            ))}
          </div>
        </div>

        {/* College/Organization */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                College/Organization
              </h4>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                {formData.collegeRestriction || 'Default : Everyone can apply'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                {formData.collegeRestrictionDetail || 'Restrict applicants based on their College/Organization'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCollegeModal(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid #FFD600',
                borderRadius: '6px',
                color: '#FFD600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Edit2 size={14} /> Change
            </button>
          </div>
        </div>

        {/* Gender */}
        <div className="unified-form-group unified-full-width">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                Gender
              </h4>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                {formData.genderRestriction || 'Default : Everyone can apply'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                {formData.genderRestrictionDetail || 'Restrict applicants based on their Gender'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGenderModal(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid #FFD600',
                borderRadius: '6px',
                color: '#FFD600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Edit2 size={14} /> Change
            </button>
          </div>
        </div>
      </div>

      {/* College/Organization Modal */}
      {showCollegeModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowCollegeModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>College/Organization Restriction</h3>
              <button className="rounds-modal-close" onClick={() => setShowCollegeModal(false)}>
                ✕
              </button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Restriction Type</label>
                <div className="unified-radio-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <div 
                    className={`unified-radio-option ${formData.collegeRestriction === 'Everyone can apply' ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('collegeRestriction', 'Everyone can apply')}
                  >
                    <input
                      type="radio"
                      name="collegeRestriction"
                      className="unified-radio-input"
                      checked={formData.collegeRestriction === 'Everyone can apply'}
                      readOnly
                    />
                    <label className="unified-radio-label">Everyone can apply</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${formData.collegeRestriction === 'Specific colleges only' ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('collegeRestriction', 'Specific colleges only')}
                  >
                    <input
                      type="radio"
                      name="collegeRestriction"
                      className="unified-radio-input"
                      checked={formData.collegeRestriction === 'Specific colleges only'}
                      readOnly
                    />
                    <label className="unified-radio-label">Specific colleges only</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${formData.collegeRestriction === 'Exclude specific colleges' ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('collegeRestriction', 'Exclude specific colleges')}
                  >
                    <input
                      type="radio"
                      name="collegeRestriction"
                      className="unified-radio-input"
                      checked={formData.collegeRestriction === 'Exclude specific colleges'}
                      readOnly
                    />
                    <label className="unified-radio-label">Exclude specific colleges</label>
                  </div>
                </div>
              </div>

              {formData.collegeRestriction !== 'Everyone can apply' && (
                <div className="unified-form-group unified-full-width" style={{ marginTop: '1rem' }}>
                  <label className="unified-form-label">College Names</label>
                  <textarea
                    className="unified-form-textarea"
                    placeholder="Enter college names (one per line)"
                    value={formData.collegeRestrictionDetail || ''}
                    onChange={(e) => handleChange('collegeRestrictionDetail', e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-secondary" onClick={() => setShowCollegeModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowCollegeModal(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gender Modal */}
      {showGenderModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowGenderModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>Gender Restriction</h3>
              <button className="rounds-modal-close" onClick={() => setShowGenderModal(false)}>
                ✕
              </button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Select Gender</label>
                <div className="unified-radio-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <div 
                    className={`unified-radio-option ${formData.genderRestriction === 'Everyone can apply' ? 'unified-selected' : ''}`}
                    onClick={() => {
                      handleChange('genderRestriction', 'Everyone can apply');
                      handleChange('genderRestrictionDetail', 'No gender restriction');
                    }}
                  >
                    <input
                      type="radio"
                      name="genderRestriction"
                      className="unified-radio-input"
                      checked={formData.genderRestriction === 'Everyone can apply'}
                      readOnly
                    />
                    <label className="unified-radio-label">Everyone can apply</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${formData.genderRestriction === 'Male only' ? 'unified-selected' : ''}`}
                    onClick={() => {
                      handleChange('genderRestriction', 'Male only');
                      handleChange('genderRestrictionDetail', 'Only male candidates can apply');
                    }}
                  >
                    <input
                      type="radio"
                      name="genderRestriction"
                      className="unified-radio-input"
                      checked={formData.genderRestriction === 'Male only'}
                      readOnly
                    />
                    <label className="unified-radio-label">Male only</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${formData.genderRestriction === 'Female only' ? 'unified-selected' : ''}`}
                    onClick={() => {
                      handleChange('genderRestriction', 'Female only');
                      handleChange('genderRestrictionDetail', 'Only female candidates can apply');
                    }}
                  >
                    <input
                      type="radio"
                      name="genderRestriction"
                      className="unified-radio-input"
                      checked={formData.genderRestriction === 'Female only'}
                      readOnly
                    />
                    <label className="unified-radio-label">Female only</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${formData.genderRestriction === 'Other' ? 'unified-selected' : ''}`}
                    onClick={() => {
                      handleChange('genderRestriction', 'Other');
                      handleChange('genderRestrictionDetail', 'Other gender candidates can apply');
                    }}
                  >
                    <input
                      type="radio"
                      name="genderRestriction"
                      className="unified-radio-input"
                      checked={formData.genderRestriction === 'Other'}
                      readOnly
                    />
                    <label className="unified-radio-label">Other</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-secondary" onClick={() => setShowGenderModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowGenderModal(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityStep;
