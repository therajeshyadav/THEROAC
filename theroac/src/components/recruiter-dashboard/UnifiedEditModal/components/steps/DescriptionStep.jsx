import React from 'react';
import '../StepStyles.css';

const DescriptionStep = ({ formData, setFormData, contentType, errors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getTypeLabel = () => {
    if (contentType === 'job') return 'Job';
    if (contentType === 'internship') return 'Internship';
    return 'Opportunity';
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Description</h2>
        <p className="unified-step-description">
          Provide detailed description about your {getTypeLabel().toLowerCase()}
        </p>
      </div>

      <div className="unified-form-grid">
        {/* About Company/Organization */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">
            About Company/Organization <span className="unified-required">*</span>
          </label>
          <textarea
            className={`unified-form-textarea ${errors.aboutCompany ? 'error' : ''}`}
            placeholder="Brief overview of your company"
            value={formData.aboutCompany || ''}
            onChange={(e) => handleChange('aboutCompany', e.target.value)}
            rows={4}
          />
          {errors.aboutCompany && <span className="unified-error-text">{errors.aboutCompany}</span>}
        </div>

        {/* Job/Internship/Opportunity Description */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">
            {getTypeLabel()} Description <span className="unified-required">*</span>
          </label>
          <textarea
            className={`unified-form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Detailed description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
          />
          {errors.description && <span className="unified-error-text">{errors.description}</span>}
        </div>

        {/* Responsibilities (for jobs/internships) */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group full-width">
            <label className="unified-form-label">
              Roles & Responsibilities <span className="unified-required">*</span>
            </label>
            <textarea
              className={`unified-form-textarea ${errors.responsibilities ? 'error' : ''}`}
              placeholder="List key responsibilities (one per line)"
              value={formData.responsibilities || ''}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              rows={6}
            />
            {errors.responsibilities && <span className="unified-error-text">{errors.responsibilities}</span>}
            <span className="unified-form-hint">Enter each responsibility on a new line</span>
          </div>
        )}

        {/* Who can apply / Requirements */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">
            Who Can Apply / Requirements <span className="unified-required">*</span>
          </label>
          <textarea
            className={`unified-form-textarea ${errors.requirements ? 'error' : ''}`}
            placeholder="List requirements (one per line)"
            value={formData.requirements || ''}
            onChange={(e) => handleChange('requirements', e.target.value)}
            rows={6}
          />
          {errors.requirements && <span className="unified-error-text">{errors.requirements}</span>}
          <span className="unified-form-hint">Enter each requirement on a new line</span>
        </div>
      </div>
    </div>
  );
};

export default DescriptionStep;
