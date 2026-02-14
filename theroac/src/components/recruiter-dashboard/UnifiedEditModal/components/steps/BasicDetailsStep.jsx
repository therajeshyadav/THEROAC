import React from 'react';
import '../StepStyles.css';

const BasicDetailsStep = ({ formData, setFormData, contentType, errors }) => {
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
        <h2 className="unified-step-title">Basic Details</h2>
        <p className="unified-step-description">
          Enter the basic information about your {getTypeLabel().toLowerCase()}
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Title */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">
            {getTypeLabel()} Title <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.title ? 'error' : ''}`}
            placeholder={`Enter ${getTypeLabel().toLowerCase()} title`}
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {errors.title && <span className="unified-error-text">{errors.title}</span>}
        </div>

        {/* Company Name */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Company Name <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.companyName ? 'error' : ''}`}
            placeholder="Enter company name"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
          {errors.companyName && <span className="unified-error-text">{errors.companyName}</span>}
        </div>

        {/* Company Logo URL */}
        <div className="unified-form-group">
          <label className="unified-form-label">Company Logo URL</label>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Enter logo URL"
            value={formData.companyLogo || ''}
            onChange={(e) => handleChange('companyLogo', e.target.value)}
          />
        </div>

        {/* Job/Internship Type */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              {getTypeLabel()} Type <span className="unified-required">*</span>
            </label>
            <select
              className={`unified-form-input ${errors.jobType ? 'error' : ''}`}
              value={formData.jobType || ''}
              onChange={(e) => handleChange('jobType', e.target.value)}
            >
              <option value="">Select type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            {errors.jobType && <span className="unified-error-text">{errors.jobType}</span>}
          </div>
        )}

        {/* Number of Openings */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              Number of Openings <span className="unified-required">*</span>
            </label>
            <input
              type="number"
              className={`unified-form-input ${errors.numberOfOpenings ? 'error' : ''}`}
              placeholder="e.g., 5"
              min="1"
              value={formData.numberOfOpenings || ''}
              onChange={(e) => handleChange('numberOfOpenings', e.target.value)}
            />
            {errors.numberOfOpenings && <span className="unified-error-text">{errors.numberOfOpenings}</span>}
          </div>
        )}

        {/* Start Date (for internships) */}
        {contentType === 'internship' && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              Start Date <span className="unified-required">*</span>
            </label>
            <input
              type="date"
              className={`unified-form-input ${errors.startDate ? 'error' : ''}`}
              value={formData.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
            {errors.startDate && <span className="unified-error-text">{errors.startDate}</span>}
          </div>
        )}

        {/* Duration (for internships) */}
        {contentType === 'internship' && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              Duration <span className="unified-required">*</span>
            </label>
            <input
              type="text"
              className={`unified-form-input ${errors.duration ? 'error' : ''}`}
              placeholder="e.g., 3 months, 6 months"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
            />
            {errors.duration && <span className="unified-error-text">{errors.duration}</span>}
          </div>
        )}

        {/* Apply By (Deadline) */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              Apply By <span className="unified-required">*</span>
            </label>
            <input
              type="date"
              className={`unified-form-input ${errors.applyBy ? 'error' : ''}`}
              value={formData.applyBy || ''}
              onChange={(e) => handleChange('applyBy', e.target.value)}
            />
            {errors.applyBy && <span className="unified-error-text">{errors.applyBy}</span>}
          </div>
        )}

        {/* Opportunity Type */}
        {contentType === 'opportunity' && (
          <>
            <div className="unified-form-group">
              <label className="unified-form-label">
                Opportunity Type <span className="unified-required">*</span>
              </label>
              <select
                className={`unified-form-input ${errors.opportunityType ? 'error' : ''}`}
                value={formData.opportunityType || ''}
                onChange={(e) => handleChange('opportunityType', e.target.value)}
              >
                <option value="">Select type</option>
                <option value="hackathon">Hackathon</option>
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
              </select>
              {errors.opportunityType && <span className="unified-error-text">{errors.opportunityType}</span>}
            </div>

            {/* Event Mode */}
            <div className="unified-form-group">
              <label className="unified-form-label">
                Event Mode <span className="unified-required">*</span>
              </label>
              <select
                className={`unified-form-input ${errors.eventMode ? 'error' : ''}`}
                value={formData.eventMode || ''}
                onChange={(e) => handleChange('eventMode', e.target.value)}
              >
                <option value="">Select mode</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.eventMode && <span className="unified-error-text">{errors.eventMode}</span>}
            </div>

            {/* Start Date */}
            <div className="unified-form-group">
              <label className="unified-form-label">
                Start Date <span className="unified-required">*</span>
              </label>
              <input
                type="datetime-local"
                className={`unified-form-input ${errors.startDate ? 'error' : ''}`}
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              {errors.startDate && <span className="unified-error-text">{errors.startDate}</span>}
            </div>

            {/* End Date */}
            <div className="unified-form-group">
              <label className="unified-form-label">
                End Date <span className="unified-required">*</span>
              </label>
              <input
                type="datetime-local"
                className={`unified-form-input ${errors.endDate ? 'error' : ''}`}
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              {errors.endDate && <span className="unified-error-text">{errors.endDate}</span>}
            </div>
          </>
        )}

        {/* Location */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Location <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.location ? 'error' : ''}`}
            placeholder={contentType === 'opportunity' ? 'Enter event location' : 'Enter job location'}
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          {errors.location && <span className="unified-error-text">{errors.location}</span>}
        </div>

        {/* Work from Home (for jobs/internships) */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group">
            <div className="unified-checkbox-group">
              <input
                type="checkbox"
                id="workFromHome"
                className="unified-checkbox-input"
                checked={formData.workFromHome || false}
                onChange={(e) => handleChange('workFromHome', e.target.checked)}
              />
              <label htmlFor="workFromHome" className="unified-checkbox-label">
                Work from Home Available
              </label>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Category <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.category ? 'error' : ''}`}
            placeholder="e.g., Technology, Marketing"
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          />
          {errors.category && <span className="unified-error-text">{errors.category}</span>}
        </div>

        {/* Perks (for jobs/internships) */}
        {(contentType === 'job' || contentType === 'internship') && (
          <div className="unified-form-group full-width">
            <label className="unified-form-label">Perks</label>
            <textarea
              className="unified-form-textarea"
              placeholder="List perks (one per line)"
              value={formData.perks || ''}
              onChange={(e) => handleChange('perks', e.target.value)}
              rows={3}
            />
            <span className="unified-form-hint">Enter each perk on a new line</span>
          </div>
        )}

        {/* Tags */}
        <div className="unified-form-group full-width">
          <label className="unified-form-label">Tags</label>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Enter tags separated by commas"
            value={formData.tags || ''}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
          <span className="unified-form-hint">Separate multiple tags with commas</span>
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsStep;
