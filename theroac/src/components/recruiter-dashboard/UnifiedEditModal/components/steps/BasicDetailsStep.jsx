import React, { useState } from 'react';
import { Upload, X, Info, Sparkles } from 'lucide-react';
import '../StepStyles.css';

const BasicDetailsStep = ({ formData, setFormData, contentType, errors, isEditMode }) => {
  const [selectedCategories, setSelectedCategories] = useState(formData.categories || []);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // If Job or Internship, render old simple form
  if (contentType === 'job' || contentType === 'internship') {
    return (
      <div className="unified-step-container">
        <div className="unified-step-header">
          <h2 className="unified-step-title">Basic Details</h2>
          <p className="unified-step-description">
            Enter the basic information about your {contentType}
          </p>
        </div>

        <div className="unified-form-grid">
          {/* Title */}
          <div className="unified-form-group full-width">
            <label className="unified-form-label">
              {contentType === 'job' ? 'Job' : 'Internship'} Title <span className="unified-required">*</span>
            </label>
            <input
              type="text"
              className={`unified-form-input ${errors.title ? 'error' : ''}`}
              placeholder={`Enter ${contentType} title`}
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
          <div className="unified-form-group">
            <label className="unified-form-label">
              {contentType === 'job' ? 'Job' : 'Internship'} Type <span className="unified-required">*</span>
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

          {/* Number of Openings */}
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

          {/* Location */}
          <div className="unified-form-group">
            <label className="unified-form-label">
              Location <span className="unified-required">*</span>
            </label>
            <input
              type="text"
              className={`unified-form-input ${errors.location ? 'error' : ''}`}
              placeholder="Enter job location"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
            {errors.location && <span className="unified-error-text">{errors.location}</span>}
          </div>

          {/* Work from Home */}
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

          {/* Perks */}
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
  }

  // Opportunity Type options
  const opportunityTypes = [
    { value: 'competition', label: 'General & Case Competitions' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'hackathon', label: 'Hackathons & Coding Challenges' },
    { value: 'webinar', label: 'Webinars, Conferences & Workshops' },
    { value: 'cultural', label: 'Creative & Cultural Events' },
    { value: 'scholarship', label: 'Scholarships' }
  ];

  // Sub-type options based on type
  const getSubTypeOptions = () => {
    const type = formData.opportunityType;
    if (type === 'competition') {
      return [
        { value: 'general', label: 'General Competition' },
        { value: 'innovation', label: 'Innovation Challenges' },
        { value: 'case', label: 'Case Competition' }
      ];
    }
    if (type === 'hackathon') {
      return [
        { value: 'online', label: 'Online Coding Challenge' },
        { value: 'offline', label: 'Offline Hackathon' },
        { value: 'hybrid', label: 'Hybrid Hackathon' }
      ];
    }
    if (type === 'webinar') {
      return [
        { value: 'webinar', label: 'Webinar' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'conference', label: 'Conference' }
      ];
    }
    return [];
  };

  // All category options
  const allCategories = [
    'AI Research', 'Applied AI', 'Machine Learning Engineering', 'Interior Designer',
    'Architectural Design', 'Product Design', 'UI/UX Design', 'Graphic Design',
    'Web Development', 'Mobile Development', 'Backend Development', 'Frontend Development',
    'Full Stack Development', 'DevOps', 'Cloud Computing', 'Cybersecurity',
    'Data Science', 'Data Analytics', 'Business Analytics', 'Marketing',
    'Digital Marketing', 'Content Writing', 'Finance', 'Accounting',
    'Human Resources', 'Operations', 'Sales', 'Customer Service',
    'Project Management', 'Product Management', 'Consulting', 'Research',
    'Education', 'Healthcare', 'Legal', 'Others'
  ];

  const handleCategoryToggle = (category) => {
    let updated;
    if (selectedCategories.includes(category)) {
      updated = selectedCategories.filter(c => c !== category);
    } else {
      updated = [...selectedCategories, category];
    }
    setSelectedCategories(updated);
    handleChange('categories', updated);
  };

  const removeCategory = (category) => {
    const updated = selectedCategories.filter(c => c !== category);
    setSelectedCategories(updated);
    handleChange('categories', updated);
  };

  const isPublished = formData.approvalStatus === 'approved' || formData.status === 'published';

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Basic details</h2>
        <p className="unified-step-description">
          Provide basic details about the opportunity, participation type, mode of event, who can participate, and what skills are required.
        </p>
      </div>

      <div className="unified-form-section">
        <h3 className="unified-section-title">About the Opportunity</h3>

        {/* Logo Upload */}
        <div className="unified-form-group">
          <label className="unified-form-label">Opportunity logo</label>
          <div className="logo-upload-area">
            {formData.logo ? (
              <div className="logo-preview-container">
                <img src={formData.logo} alt="Logo" className="logo-preview-image" />
                <button
                  type="button"
                  className="change-logo-btn"
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  Change Logo
                </button>
              </div>
            ) : (
              <div className="logo-upload-placeholder" onClick={() => document.getElementById('logo-upload').click()}>
                <Upload size={24} style={{ color: '#FFD600' }} />
                <span>Upload Logo</span>
              </div>
            )}
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Opportunity Title */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Opportunity Title <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.title ? 'error' : ''}`}
            placeholder="Enter opportunity title"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={190}
          />
          <span className="unified-form-hint">Max 190 characters</span>
          {errors.title && <span className="unified-error-text">{errors.title}</span>}
        </div>

        {/* Organisation Name */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Organisation Name <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.organizationName ? 'error' : ''}`}
            placeholder="Enter organisation name"
            value={formData.organizationName || ''}
            onChange={(e) => handleChange('organizationName', e.target.value)}
          />
          {errors.organizationName && <span className="unified-error-text">{errors.organizationName}</span>}
        </div>

        {/* Opportunity Type */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Opportunity Type <span className="unified-required">*</span>
          </label>
          <div className="select-with-tooltip">
            <select
              className={`unified-form-input ${errors.opportunityType ? 'error' : ''}`}
              value={formData.opportunityType || ''}
              onChange={(e) => handleChange('opportunityType', e.target.value)}
              disabled={isPublished}
            >
              <option value="">Select type</option>
              {opportunityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {isPublished && (
              <div className="field-disabled-tooltip">
                Cannot be changed when opportunity is live
              </div>
            )}
          </div>
          {errors.opportunityType && <span className="unified-error-text">{errors.opportunityType}</span>}
        </div>

        {/* Opportunity Sub-type */}
        {formData.opportunityType && (
          <div className="unified-form-group">
            <label className="unified-form-label">
              Opportunity Sub-type <span className="unified-required">*</span>
            </label>
            <select
              className={`unified-form-input ${errors.opportunitySubType ? 'error' : ''}`}
              value={formData.opportunitySubType || ''}
              onChange={(e) => handleChange('opportunitySubType', e.target.value)}
            >
              <option value="">Select sub-type</option>
              {getSubTypeOptions().map(subType => (
                <option key={subType.value} value={subType.value}>{subType.label}</option>
              ))}
            </select>
            {errors.opportunitySubType && <span className="unified-error-text">{errors.opportunitySubType}</span>}
          </div>
        )}

        {/* Opportunity Category */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Opportunity Category <span className="unified-required">*</span>
            <Info size={16} style={{ marginLeft: '4px', color: '#888' }} />
          </label>
          
          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="selected-categories-container">
              {selectedCategories.map(category => (
                <div key={category} className="category-tag">
                  {category}
                  <button
                    type="button"
                    className="category-remove-btn"
                    onClick={() => removeCategory(category)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Category Dropdown */}
          <div className="category-select-wrapper">
            <div
              className="unified-form-input category-select-trigger"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              Select opportunity category
            </div>
            {showCategoryDropdown && (
              <div className="category-dropdown">
                {allCategories.map(category => (
                  <div
                    key={category}
                    className={`category-option ${selectedCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                    {selectedCategories.includes(category) && (
                      <span className="category-checkmark">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.categories && <span className="unified-error-text">{errors.categories}</span>}
        </div>

        {/* Link Festival/Campaign */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Link Festival/Campaign
            <Info size={16} style={{ marginLeft: '4px', color: '#888' }} />
          </label>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Enter Festival/campaign name"
            value={formData.festivalCampaign || ''}
            onChange={(e) => handleChange('festivalCampaign', e.target.value)}
          />
        </div>

        {/* Company Website URL */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Company Website URL
            <Info size={16} style={{ marginLeft: '4px', color: '#888' }} />
          </label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://"
            value={formData.companyWebsite || ''}
            onChange={(e) => handleChange('companyWebsite', e.target.value)}
          />
        </div>
      </div>

      {/* About the Opportunity - Description */}
      <div className="unified-form-section">
        <h3 className="unified-section-title">About the Opportunity</h3>

        <div className="unified-form-group">
          <div className="label-with-action">
            <label className="unified-form-label">
              Opportunity Description <span className="unified-required">*</span>
            </label>
            <button type="button" className="generate-ai-btn">
              <Sparkles size={16} />
              Generate with AI
            </button>
          </div>
          <p className="unified-form-hint">Include Rules, Eligibility, Process, Format, etc.</p>
          
          <textarea
            className={`unified-form-textarea rich-text-area ${errors.description ? 'error' : ''}`}
            placeholder="Enter opportunity description..."
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={10}
          />
          {errors.description && <span className="unified-error-text">{errors.description}</span>}
        </div>
      </div>

      {/* Skills to be assessed */}
      <div className="unified-form-section">
        <div className="unified-form-group">
          <label className="unified-form-label">
            Skills to be assessed
            <Info size={16} style={{ marginLeft: '4px', color: '#888' }} />
          </label>
          <p className="unified-form-hint">
            List required skills to attract participants with matching abilities or engage individuals eager to improve them
          </p>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Example: Photoshop, MS Office, etc."
            value={formData.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
          />
        </div>
      </div>

      {/* Opportunity Mode & Participation Type */}
      <div className="unified-form-section">
        <h3 className="unified-section-title">Opportunity Mode & Participation Type</h3>

        {/* Participation Type */}
        <div className="unified-form-group">
          <label className="unified-form-label">Participation Type</label>
          <div className="button-group">
            <button
              type="button"
              className={`option-btn ${formData.participationType === 'individual' ? 'active' : ''}`}
              onClick={() => {
                handleChange('participationType', 'individual');
                handleChange('minTeamSize', 1);
                handleChange('maxTeamSize', 1);
              }}
            >
              Individual
            </button>
            <button
              type="button"
              className={`option-btn ${formData.participationType === 'team' ? 'active' : ''}`}
              onClick={() => handleChange('participationType', 'team')}
            >
              Team Participation
            </button>
          </div>
        </div>

        {/* Team Size */}
        {formData.participationType === 'team' && (
          <div className="unified-form-group">
            <label className="unified-form-label">Set team size</label>
            <div className="team-size-inputs">
              <div className="team-size-input-group">
                <label>Min:</label>
                <input
                  type="number"
                  className="unified-form-input"
                  min="1"
                  value={formData.minTeamSize || 1}
                  onChange={(e) => handleChange('minTeamSize', parseInt(e.target.value))}
                />
              </div>
              <div className="team-size-input-group">
                <label>Max:</label>
                <input
                  type="number"
                  className="unified-form-input"
                  min={formData.minTeamSize || 1}
                  value={formData.maxTeamSize || 1}
                  onChange={(e) => handleChange('maxTeamSize', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mode of Opportunity */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            Mode of Opportunity
            <Info size={16} style={{ marginLeft: '4px', color: '#888' }} />
          </label>
          <div className="button-group">
            <button
              type="button"
              className={`option-btn ${formData.mode === 'online' ? 'active' : ''}`}
              onClick={() => handleChange('mode', 'online')}
            >
              Online
            </button>
            <button
              type="button"
              className={`option-btn ${formData.mode === 'offline' ? 'active' : ''}`}
              onClick={() => handleChange('mode', 'offline')}
            >
              Offline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsStep;
