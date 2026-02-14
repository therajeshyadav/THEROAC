import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import '../StepStyles.css';

const DetailsStep = ({ formData, setFormData, contentType, errors, authUser }) => {
  const [logoPreview, setLogoPreview] = useState(formData.companyLogo || null);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Initialize company data from authUser
  React.useEffect(() => {
    if (authUser && !formData.companyName) {
      // Fetch from user profile
      const companyName = authUser.companyName || authUser.company?.name || '';
      const companyLogo = authUser.companyLogo || authUser.company?.logo || '';
      
      if (companyName) {
        setFormData(prev => ({ ...prev, companyName }));
      }
      if (companyLogo) {
        setFormData(prev => ({ ...prev, companyLogo }));
        setLogoPreview(companyLogo);
      }
    }
  }, [authUser, formData.companyName, setFormData]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        handleChange('companyLogo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isJob = contentType === 'job';
  const isInternship = contentType === 'internship';
  const isOpportunity = contentType === 'opportunity';

  const getTitle = () => {
    if (isJob) return 'Job Details';
    if (isInternship) return 'Internships Details';
    return 'Basic details';
  };

  const getDescription = () => {
    if (isOpportunity) return 'Provide basic details for the opportunity listing';
    return 'Provide basic details for the internship listing, including role, skills required, location, stipend, & registration dates etc.';
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">{getTitle()}</h2>
        <p className="unified-step-description">{getDescription()}</p>
      </div>

      <div className="unified-form-grid">
        {/* About the Internship/Job Section */}
        <div className="unified-form-group unified-full-width">
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1rem', marginTop: '0' }}>
            About the {isOpportunity ? 'Opportunity' : isJob ? 'Job' : 'Internship'}
          </h3>
        </div>

        {/* Title */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            {isOpportunity ? 'Opportunity' : isJob ? 'Job' : 'Internship'} Title <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.title ? 'unified-error' : ''}`}
            placeholder="e.g., Front End Developer"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={190}
          />
          <span className="unified-form-hint">Max 190 characters</span>
          {errors.title && <span className="unified-error-text">{errors.title}</span>}
        </div>

        {/* Company */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Company</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="text"
              className="unified-form-input"
              value={formData.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Company name"
              style={{ flex: 1 }}
            />
            {logoPreview && (
              <img 
                src={logoPreview} 
                alt="Company logo" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  objectFit: 'contain', 
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.25rem'
                }} 
              />
            )}
            <label htmlFor="logo-upload" style={{ color: '#FFD600', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Update Logo
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Category */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            {isOpportunity ? 'Opportunity' : isJob ? 'Job' : 'Internship'} Category <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.category ? 'unified-error' : ''}`}
            placeholder="Select internship category"
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          />
          {errors.category && <span className="unified-error-text">{errors.category}</span>}
        </div>

        {/* Work Arrangements - Job/Internship only */}
        {!isOpportunity && (
          <>
            <div className="unified-form-group unified-full-width" style={{ marginTop: '1rem' }}>
              <label className="unified-form-label">Select applicable work arrangements</label>
              <div className="unified-radio-group">
                {['Full-Time', 'Part-Time', 'Contractual'].map((option) => (
                  <div 
                    key={option}
                    className={`unified-radio-option ${formData.workArrangement === option ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('workArrangement', option)}
                  >
                    <input
                      type="radio"
                      name="workArrangement"
                      className="unified-radio-input"
                      checked={formData.workArrangement === option}
                      readOnly
                    />
                    <label className="unified-radio-label">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="unified-form-group">
              <label className="unified-form-label">
                {isInternship ? 'Internship' : 'Job'} Duration <span className="unified-required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="unified-form-input"
                  value={formData.durationType || 'Months'}
                  onChange={(e) => handleChange('durationType', e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                  <option value="Weeks">Weeks</option>
                </select>
                <input
                  type="number"
                  className="unified-form-input"
                  value={formData.duration || ''}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="3"
                  style={{ width: '100px' }}
                  min="1"
                />
              </div>
            </div>

            {/* Working Days */}
            <div className="unified-form-group">
              <label className="unified-form-label">Working Days</label>
              <div className="unified-radio-group">
                {['4 Days', '5 Days', '6 Days', 'Alternate Saturdays Off'].map((option) => (
                  <div 
                    key={option}
                    className={`unified-radio-option ${formData.workingDays === option ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('workingDays', option)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <input
                      type="radio"
                      name="workingDays"
                      className="unified-radio-input"
                      checked={formData.workingDays === option}
                      readOnly
                    />
                    <label className="unified-radio-label">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Schedule */}
            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">Job schedule</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  'Day shift', 'Morning shift', 'Evening shift', 'Night shift', 'Flexible Work Hours',
                  'Rotational shift', 'Fixed shift', 'UK shift', 'US shift', 'Monday to Friday',
                  'Weekend Availability', 'Weekend only'
                ].map((schedule) => (
                  <div 
                    key={schedule}
                    className={`unified-radio-option ${(formData.jobSchedule || []).includes(schedule) ? 'unified-selected' : ''}`}
                    onClick={() => {
                      const current = formData.jobSchedule || [];
                      const updated = current.includes(schedule)
                        ? current.filter(s => s !== schedule)
                        : [...current, schedule];
                      handleChange('jobSchedule', updated);
                    }}
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <label className="unified-radio-label" style={{ cursor: 'pointer' }}>{schedule}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No. of openings */}
        <div className="unified-form-group">
          <label className="unified-form-label">
            No. of openings <span className="unified-required">*</span>
          </label>
          <input
            type="number"
            className={`unified-form-input ${errors.openings ? 'unified-error' : ''}`}
            value={formData.openings || ''}
            onChange={(e) => handleChange('openings', e.target.value)}
            min="1"
          />
          {errors.openings && <span className="unified-error-text">{errors.openings}</span>}
        </div>

        <div className="unified-form-group">
          <div className="unified-checkbox-group" style={{ marginTop: '1.8rem' }}>
            <input
              type="checkbox"
              id="hideOpenings"
              className="unified-checkbox-input"
              checked={formData.hideOpenings || false}
              onChange={(e) => handleChange('hideOpenings', e.target.checked)}
            />
            <label htmlFor="hideOpenings" className="unified-checkbox-label">
              Hide No. of openings from candidates
            </label>
          </div>
        </div>

        {/* Link Festival/Campaign - Job/Internship only */}
        {!isOpportunity && (
          <div className="unified-form-group unified-full-width">
            <label className="unified-form-label">Link Festival/Campaign</label>
            <input
              type="text"
              className="unified-form-input"
              placeholder="Enter Festival/campaign name"
              value={formData.festivalCampaign || ''}
              onChange={(e) => handleChange('festivalCampaign', e.target.value)}
            />
          </div>
        )}

        {/* Company Website URL */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Company Website URL</label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://"
            value={formData.companyWebsite || ''}
            onChange={(e) => handleChange('companyWebsite', e.target.value)}
          />
        </div>

        {/* Work Location Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1rem' }}>Work Location</h3>
          <label className="unified-form-label">Select work setup for this role</label>
          <div className="unified-radio-group">
            {['In Office', 'Remote', 'Hybrid', 'Field job'].map((option) => (
              <div 
                key={option}
                className={`unified-radio-option ${formData.workSetup === option ? 'unified-selected' : ''}`}
                onClick={() => handleChange('workSetup', option)}
              >
                <input
                  type="radio"
                  name="workSetup"
                  className="unified-radio-input"
                  checked={formData.workSetup === option}
                  readOnly
                />
                <label className="unified-radio-label">{option}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Work Location */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Enter Work Location</label>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Search by city, state, country"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          <span className="unified-form-hint">
            <a href="#" style={{ color: '#FFD600', textDecoration: 'none' }}>📍 Current location</a>
          </span>
        </div>

        {/* About the role and skills */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1rem' }}>About the role and skills</h3>
        </div>

        {/* Description */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            {isOpportunity ? 'Opportunity' : isJob ? 'Job' : 'Internship'} Description <span className="unified-required">*</span>
          </label>
          <span className="unified-form-hint" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Include role expectations, required skills and key responsibilities
          </span>
          <textarea
            className={`unified-form-textarea ${errors.description ? 'unified-error' : ''}`}
            placeholder="Enter description..."
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={10}
          />
          {errors.description && <span className="unified-error-text">{errors.description}</span>}
        </div>

        {/* Skills required */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Skills required</label>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Add skills (comma separated, max 10)"
            value={formData.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
          />
          <span className="unified-form-hint">Add up to 10 skills. We'll use these to show candidates at a glance what you're looking for</span>
        </div>

        {/* Salary & Benefits - Job/Internship only */}
        {!isOpportunity && (
          <>
            <div className="unified-form-group unified-full-width" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1rem' }}>
                {isInternship ? 'Stipend' : 'Salary'} & Benefits
              </h3>
            </div>

            {/* Pay Structure */}
            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">How is the pay structured?</label>
              <div className="unified-radio-group">
                {['Fixed', 'Range', 'Fixed + Variable', 'Unpaid'].map((option) => (
                  <div 
                    key={option}
                    className={`unified-radio-option ${formData.payStructure === option ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('payStructure', option)}
                  >
                    <input
                      type="radio"
                      name="payStructure"
                      className="unified-radio-input"
                      checked={formData.payStructure === option}
                      readOnly
                    />
                    <label className="unified-radio-label">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            {formData.payStructure !== 'Unpaid' && (
              <>
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">Enter {isInternship ? 'stipend' : 'salary'} range</label>
                </div>

                <div className="unified-form-group">
                  <select
                    className="unified-form-input"
                    value={formData.salaryPeriod || 'Monthly'}
                    onChange={(e) => handleChange('salaryPeriod', e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>

                <div className="unified-form-group">
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

                <div className="unified-form-group">
                  <label className="unified-form-label">Min</label>
                  <input
                    type="number"
                    className="unified-form-input"
                    placeholder="2,000"
                    value={formData.salaryMin || ''}
                    onChange={(e) => handleChange('salaryMin', e.target.value)}
                  />
                </div>

                <div className="unified-form-group">
                  <label className="unified-form-label">Max</label>
                  <input
                    type="number"
                    className="unified-form-input"
                    placeholder="7,000"
                    value={formData.salaryMax || ''}
                    onChange={(e) => handleChange('salaryMax', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Benefits/Perks */}
            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">Benefits/Perks</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  'Job Offer', 'Certificate of Completion', 'Letter of Recommendation',
                  'Medical Insurance', 'Transport', 'Food & Beverages', 'In-Office Gym/Yoga Studio',
                  'Learning Allowance', 'Office Library', 'Flexible Hours', 'Hybrid Working',
                  'Recreation Passes', 'Snacks Facilities', '5 Day Placement Offer', 'Other'
                ].map((benefit) => (
                  <div 
                    key={benefit}
                    className={`unified-radio-option ${(formData.benefits || []).includes(benefit) ? 'unified-selected' : ''}`}
                    onClick={() => {
                      const current = formData.benefits || [];
                      const updated = current.includes(benefit)
                        ? current.filter(b => b !== benefit)
                        : [...current, benefit];
                      handleChange('benefits', updated);
                    }}
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <label className="unified-radio-label" style={{ cursor: 'pointer' }}>{benefit}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailsStep;
