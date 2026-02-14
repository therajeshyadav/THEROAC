import React from 'react';
import '../StepStyles.css';

const WorkDetailsStep = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Work Details</h2>
        <p className="unified-step-description">
          Provide details about the work arrangement and compensation
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Stipend/Salary Range */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Stipend/Salary (Min) <span className="unified-required">*</span>
          </label>
          <input
            type="number"
            className={`unified-form-input ${errors.salaryMin ? 'error' : ''}`}
            placeholder="Minimum amount"
            value={formData.salaryMin || ''}
            onChange={(e) => handleChange('salaryMin', e.target.value)}
          />
          {errors.salaryMin && <span className="unified-error-text">{errors.salaryMin}</span>}
        </div>

        <div className="unified-form-group">
          <label className="unified-form-label">
            Stipend/Salary (Max) <span className="unified-required">*</span>
          </label>
          <input
            type="number"
            className={`unified-form-input ${errors.salaryMax ? 'error' : ''}`}
            placeholder="Maximum amount"
            value={formData.salaryMax || ''}
            onChange={(e) => handleChange('salaryMax', e.target.value)}
          />
          {errors.salaryMax && <span className="unified-error-text">{errors.salaryMax}</span>}
        </div>

        {/* Currency */}
        <div className="unified-form-group">
          <label className="unified-form-label">Currency</label>
          <select
            className="unified-form-input"
            value={formData.currency || 'INR'}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        {/* Salary Period */}
        <div className="unified-form-group">
          <label className="unified-form-label">Salary Period</label>
          <select
            className="unified-form-input"
            value={formData.salaryPeriod || 'month'}
            onChange={(e) => handleChange('salaryPeriod', e.target.value)}
          >
            <option value="hour">Per Hour</option>
            <option value="month">Per Month</option>
            <option value="year">Per Year</option>
          </select>
        </div>

        {/* Employment Type */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Employment Type <span className="unified-required">*</span>
          </label>
          <select
            className={`unified-form-input ${errors.employmentType ? 'error' : ''}`}
            value={formData.employmentType || ''}
            onChange={(e) => handleChange('employmentType', e.target.value)}
          >
            <option value="">Select type</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
          {errors.employmentType && <span className="unified-error-text">{errors.employmentType}</span>}
        </div>

        {/* Work Mode */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Work Mode <span className="unified-required">*</span>
          </label>
          <select
            className={`unified-form-input ${errors.workMode ? 'error' : ''}`}
            value={formData.workMode || ''}
            onChange={(e) => handleChange('workMode', e.target.value)}
          >
            <option value="">Select mode</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.workMode && <span className="unified-error-text">{errors.workMode}</span>}
        </div>

        {/* Experience Level */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Experience Level <span className="unified-required">*</span>
          </label>
          <select
            className={`unified-form-input ${errors.experienceLevel ? 'error' : ''}`}
            value={formData.experienceLevel || ''}
            onChange={(e) => handleChange('experienceLevel', e.target.value)}
          >
            <option value="">Select level</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (2-5 years)</option>
            <option value="senior">Senior Level (5+ years)</option>
          </select>
          {errors.experienceLevel && <span className="unified-error-text">{errors.experienceLevel}</span>}
        </div>

        {/* Skills Required */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">
            Skills Required <span className="unified-required">*</span>
          </label>
          <textarea
            className={`unified-form-textarea ${errors.skills ? 'error' : ''}`}
            placeholder="List required skills (comma separated)"
            value={formData.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
            rows={3}
          />
          {errors.skills && <span className="unified-error-text">{errors.skills}</span>}
          <span className="unified-form-hint">Separate skills with commas</span>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailsStep;
