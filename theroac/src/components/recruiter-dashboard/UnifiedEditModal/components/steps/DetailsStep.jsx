import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import '../StepStyles.css';

const DetailsStep = ({ formData, setFormData, contentType, errors, authUser }) => {
  const [logoPreview, setLogoPreview] = useState(formData.companyLogo || null);
  
  console.log('🎯 DetailsStep - workArrangement:', formData.workArrangement, 'workSetup:', formData.workSetup);

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
    if (isOpportunity) return 'Provide basic details about the opportunity, participation type, mode of event, who can participate, and what skills are required.';
    return 'Provide basic details for the internship listing, including role, skills required, location, stipend, & registration dates etc.';
  };

  // For Opportunity - render new detailed form
  if (isOpportunity) {
    return <OpportunityDetailsForm formData={formData} setFormData={setFormData} errors={errors} authUser={authUser} />;
  }

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
                {[
                  { value: 'full-time', label: 'Full-Time' },
                  { value: 'part-time', label: 'Part-Time' },
                  { value: 'contract', label: 'Contractual' }
                ].map((option) => (
                  <div 
                    key={option.value}
                    className={`unified-radio-option ${formData.jobType === option.value ? 'unified-selected' : ''}`}
                    onClick={() => handleChange('jobType', option.value)}
                  >
                    <input
                      type="radio"
                      name="jobType"
                      className="unified-radio-input"
                      checked={formData.jobType === option.value}
                      readOnly
                    />
                    <label className="unified-radio-label">{option.label}</label>
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
                  <label className="unified-form-label">
                    Enter {isInternship ? 'stipend' : 'salary'} 
                    {formData.payStructure === 'Fixed' ? ' amount' : 
                     formData.payStructure === 'Range' ? ' range' : 
                     ' (fixed + variable)'}
                  </label>
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

                {/* Fixed: Single amount field */}
                {formData.payStructure === 'Fixed' && (
                  <div className="unified-form-group unified-full-width">
                    <label className="unified-form-label">Amount</label>
                    <input
                      type="number"
                      className="unified-form-input"
                      placeholder="50,000"
                      value={formData.salaryFixed || ''}
                      onChange={(e) => handleChange('salaryFixed', e.target.value)}
                    />
                  </div>
                )}

                {/* Range: Min and Max fields */}
                {formData.payStructure === 'Range' && (
                  <>
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

                {/* Fixed + Variable: Fixed amount and Variable amount */}
                {formData.payStructure === 'Fixed + Variable' && (
                  <>
                    <div className="unified-form-group">
                      <label className="unified-form-label">Fixed Amount</label>
                      <input
                        type="number"
                        className="unified-form-input"
                        placeholder="30,000"
                        value={formData.salaryFixed || ''}
                        onChange={(e) => handleChange('salaryFixed', e.target.value)}
                      />
                    </div>

                    <div className="unified-form-group">
                      <label className="unified-form-label">Variable Amount</label>
                      <input
                        type="number"
                        className="unified-form-input"
                        placeholder="20,000"
                        value={formData.salaryVariable || ''}
                        onChange={(e) => handleChange('salaryVariable', e.target.value)}
                      />
                    </div>
                  </>
                )}
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

// Opportunity Details Form Component
const OpportunityDetailsForm = ({ formData, setFormData, errors, authUser }) => {
  const [selectedCategories, setSelectedCategories] = useState(formData.categories || []);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(
    typeof formData.skills === 'string' 
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(formData.skills) 
        ? formData.skills 
        : []
  );
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [logoPreview, setLogoPreview] = useState(formData.companyLogo || null);

  // Update selectedCategories when formData.categories changes (on edit load)
  React.useEffect(() => {
    if (formData.categories && Array.isArray(formData.categories)) {
      console.log('📂 Loading categories for edit:', formData.categories);
      setSelectedCategories(formData.categories);
    }
  }, [formData.categories]);

  // Update selectedSkills when formData.skills changes (on edit load)
  React.useEffect(() => {
    if (formData.skills) {
      const skillsArray = typeof formData.skills === 'string' 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(formData.skills) 
          ? formData.skills 
          : [];
      setSelectedSkills(skillsArray);
    }
  }, [formData.skills]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Initialize organization data from authUser
  React.useEffect(() => {
    if (authUser && !formData.companyName) {
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

  const handleLogoUpload = (e) => {
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

  // All skills options
  const allSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'Sass', 'Bootstrap', 'Tailwind CSS', 'Material UI',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Excel',
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD', 'InDesign',
    'Video Editing', 'Premiere Pro', 'After Effects', 'Final Cut Pro',
    'Content Writing', 'Copywriting', 'Technical Writing', 'SEO', 'SEM',
    'Social Media Marketing', 'Email Marketing', 'Google Analytics', 'Facebook Ads',
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Project Management', 'Agile', 'Scrum', 'Kanban',
    'Public Speaking', 'Presentation Skills', 'Negotiation', 'Sales',
    'Customer Service', 'MS Office', 'MS Word', 'MS Excel', 'MS PowerPoint'
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

  const handleSkillToggle = (skill) => {
    let updated;
    if (selectedSkills.includes(skill)) {
      updated = selectedSkills.filter(s => s !== skill);
    } else {
      updated = [...selectedSkills, skill];
    }
    setSelectedSkills(updated);
    handleChange('skills', updated.join(', '));
  };

  const removeSkill = (skill) => {
    const updated = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(updated);
    handleChange('skills', updated.join(', '));
  };

  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

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
            {logoPreview ? (
              <div className="logo-preview-container">
                <img src={logoPreview} alt="Logo" className="logo-preview-image" />
                <button
                  type="button"
                  className="change-logo-btn"
                  onClick={() => document.getElementById('opp-logo-upload').click()}
                >
                  Change Logo
                </button>
              </div>
            ) : (
              <div className="logo-upload-placeholder" onClick={() => document.getElementById('opp-logo-upload').click()}>
                <Upload size={24} style={{ color: '#FFD600' }} />
                <span>Upload Logo</span>
              </div>
            )}
            <input
              type="file"
              id="opp-logo-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Opportunity Title */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            Opportunity Title <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.title ? 'unified-error' : ''}`}
            placeholder="Enter opportunity title"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={190}
          />
          <span className="unified-form-hint">Max 190 characters</span>
          {errors.title && <span className="unified-error-text">{errors.title}</span>}
        </div>

        {/* Organisation Name */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            Organisation Name <span className="unified-required">*</span>
          </label>
          <input
            type="text"
            className={`unified-form-input ${errors.companyName ? 'unified-error' : ''}`}
            placeholder="Enter organisation name"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
          {errors.companyName && <span className="unified-error-text">{errors.companyName}</span>}
        </div>

        {/* Opportunity Type */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            Opportunity Type <span className="unified-required">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className={`unified-form-input ${errors.opportunityType ? 'unified-error' : ''} ${isPublished ? 'disabled-field' : ''}`}
              value={formData.opportunityType || ''}
              onChange={(e) => handleChange('opportunityType', e.target.value)}
              disabled={isPublished}
              title={isPublished ? 'Cannot be changed when opportunity is live' : ''}
            >
              <option value="">Select type</option>
              {opportunityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {errors.opportunityType && <span className="unified-error-text">{errors.opportunityType}</span>}
        </div>

        {/* Opportunity Sub-type */}
        {formData.opportunityType && (
          <div className="unified-form-group unified-full-width">
            <label className="unified-form-label">
              Opportunity Sub-type <span className="unified-required">*</span>
            </label>
            <select
              className={`unified-form-input ${errors.opportunitySubType ? 'unified-error' : ''}`}
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
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            Opportunity Category <span className="unified-required">*</span>
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
                    ×
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
      </div>

      {/* About the Opportunity - Description */}
      <div className="unified-form-section">
        <h3 className="unified-section-title">About the Opportunity</h3>

        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">
            Opportunity Description <span className="unified-required">*</span>
          </label>
          <span className="unified-form-hint">Include Rules, Eligibility, Process, Format, etc.</span>
          
          <textarea
            className={`unified-form-textarea ${errors.description ? 'unified-error' : ''}`}
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
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Skills to be assessed</label>
          <span className="unified-form-hint">
            List required skills to attract participants with matching abilities or engage individuals eager to improve them
          </span>
          
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="selected-categories-container" style={{ marginBottom: '0.75rem' }}>
              {selectedSkills.map(skill => (
                <div key={skill} className="category-tag">
                  {skill}
                  <button
                    type="button"
                    className="category-remove-btn"
                    onClick={() => removeSkill(skill)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Skills Dropdown with Search */}
          <div className="category-select-wrapper">
            <input
              type="text"
              className="unified-form-input"
              placeholder="Search and select skills..."
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              onFocus={() => setShowSkillsDropdown(true)}
            />
            {showSkillsDropdown && (
              <div className="category-dropdown" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {filteredSkills.length > 0 ? (
                  filteredSkills.map(skill => (
                    <div
                      key={skill}
                      className={`category-option ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSkillToggle(skill);
                        setSkillSearchQuery('');
                      }}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <span className="category-checkmark">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                    No skills found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Close dropdown when clicking outside */}
          {showSkillsDropdown && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1
              }}
              onClick={() => setShowSkillsDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Opportunity Mode & Participation Type */}
      <div className="unified-form-section">
        <h3 className="unified-section-title">Opportunity Mode & Participation Type</h3>

        {/* Participation Type */}
        <div className="unified-form-group unified-full-width">
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
          <div className="unified-form-group unified-full-width">
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
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Mode of Opportunity</label>
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

export default DetailsStep;
