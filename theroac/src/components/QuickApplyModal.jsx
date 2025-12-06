import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Check } from 'lucide-react';
import './QuickApplyModal.css';

const QuickApplyModal = ({ isOpen, onClose, jobData, userData, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debug logs
  console.log("QuickApplyModal - isOpen:", isOpen);
  console.log("QuickApplyModal - jobData:", jobData);
  console.log("QuickApplyModal - userData:", userData);
  
  const [formData, setFormData] = useState({
    // Basic Details
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    location: '',
    instituteName: '',
    differentlyAbled: 'no',
    
    // User Details
    userType: 'college-student',
    domain: '',
    course: '',
    courseSpecialization: '',
    graduationYear: '',
    courseDuration: '',
    
    // Additional Details
    resumeFile: null,
    coverLetter: '',
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (userData && isOpen) {
      console.log("Pre-filling form with userData:", userData);
      
      const prefilledData = {
        ...formData,
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        location: userData.location || userData.city || (userData.state ? `${userData.city}, ${userData.state}` : ''),
        instituteName: userData.education?.[0]?.institute || '',
        domain: userData.education?.[0]?.domain || '',
        course: userData.education?.[0]?.degree || '',
        courseSpecialization: userData.education?.[0]?.specialization || '',
        graduationYear: userData.education?.[0]?.graduationYear || '',
        courseDuration: userData.education?.[0]?.duration || '',
      };
      
      console.log("Pre-filled form data:", prefilledData);
      setFormData(prefilledData);
    }
  }, [userData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, resumeFile: file }));
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Quick apply error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    console.log("QuickApplyModal - Not rendering (isOpen is false)");
    return null;
  }

  console.log("QuickApplyModal - Rendering modal");

  return (
    <div className="quick-apply-overlay" onClick={(e) => {
      // Close modal if clicking on overlay (not on modal content)
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="quick-apply-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-apply-header">
          <div>
            <h2 className="quick-apply-title">Quick Apply</h2>
            <p className="quick-apply-subtitle">
              {jobData?.title} at {jobData?.companyName}
            </p>
          </div>
          <button onClick={onClose} className="quick-apply-close">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="quick-apply-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="progress-circle">1</div>
            <span>Basic Details</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`} />
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="progress-circle">2</div>
            <span>User Details</span>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`} />
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="progress-circle">3</div>
            <span>Additional Details</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="quick-apply-content">
          {/* Debug info - remove after testing */}
          {(!jobData || !userData) && (
            <div style={{ padding: '20px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '20px' }}>
              <strong>Debug Info:</strong>
              <div>jobData: {jobData ? 'Available' : 'Missing'}</div>
              <div>userData: {userData ? 'Available' : 'Missing'}</div>
            </div>
          )}
          
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="form-step" style={{ background: 'white', padding: '20px' }}>
              <h3 className="step-title">Basic Details</h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Please provide your basic information. Fields marked with * are required.
              </p>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName.split(' ')[0] || ''}
                    onChange={(e) => {
                      const lastName = formData.fullName.split(' ').slice(1).join(' ');
                      handleInputChange('fullName', `${e.target.value} ${lastName}`.trim());
                    }}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.fullName.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const firstName = formData.fullName.split(' ')[0] || '';
                      handleInputChange('fullName', `${firstName} ${e.target.value}`.trim());
                    }}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile <span className="required">*</span></label>
                  <div className="phone-input">
                    <span className="country-code">🇮🇳 +91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="9876543210"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Gender <span className="required">*</span></label>
                <div className="radio-group">
                  {['Female', 'Male', 'Transgender', 'Non-binary', 'Prefer not to say'].map(option => (
                    <label key={option} className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value={option.toLowerCase()}
                        checked={formData.gender === option.toLowerCase()}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Location <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State, Country"
                  required
                />
              </div>

              <div className="form-group">
                <label>Institute Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.instituteName}
                  onChange={(e) => handleInputChange('instituteName', e.target.value)}
                  placeholder="Enter your institute name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Differently Abled <span className="required">*</span></label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="differentlyAbled"
                      value="no"
                      checked={formData.differentlyAbled === 'no'}
                      onChange={(e) => handleInputChange('differentlyAbled', e.target.value)}
                    />
                    <span>No</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="differentlyAbled"
                      value="yes"
                      checked={formData.differentlyAbled === 'yes'}
                      onChange={(e) => handleInputChange('differentlyAbled', e.target.value)}
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: User Details */}
          {currentStep === 2 && (
            <div className="form-step" style={{ background: 'white', padding: '20px' }}>
              <h3 className="step-title">User Details</h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Tell us about your educational background and professional status.
              </p>
              
              <div className="form-group">
                <label>Type <span className="required">*</span></label>
                <div className="radio-group">
                  {['College Students', 'Professional', 'Fresher'].map(option => (
                    <label key={option} className="radio-label">
                      <input
                        type="radio"
                        name="userType"
                        value={option.toLowerCase().replace(' ', '-')}
                        checked={formData.userType === option.toLowerCase().replace(' ', '-')}
                        onChange={(e) => handleInputChange('userType', e.target.value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Domain <span className="required">*</span></label>
                <select
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  required
                >
                  <option value="">Select domain</option>
                  <option value="engineering">Engineering</option>
                  <option value="management">Management</option>
                  <option value="design">Design</option>
                  <option value="science">Science</option>
                  <option value="arts">Arts</option>
                  <option value="commerce">Commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course <span className="required">*</span></label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  required
                >
                  <option value="">Select course</option>
                  <option value="B.Tech/BE">B.Tech/BE (Bachelor of Technology / Bachelor of Engineering)</option>
                  <option value="M.Tech/ME">M.Tech/ME (Master of Technology / Master of Engineering)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="BSc">BSc (Bachelor of Science)</option>
                  <option value="MSc">MSc (Master of Science)</option>
                  <option value="MBA">MBA (Master of Business Administration)</option>
                  <option value="BBA">BBA (Bachelor of Business Administration)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course Specialization <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.courseSpecialization}
                  onChange={(e) => handleInputChange('courseSpecialization', e.target.value)}
                  placeholder="e.g., Computer Science and Engineering"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Graduation Year <span className="required">*</span></label>
                  <div className="radio-group">
                    {['2025', '2026', '2027', '2028'].map(year => (
                      <label key={year} className="radio-label">
                        <input
                          type="radio"
                          name="graduationYear"
                          value={year}
                          checked={formData.graduationYear === year}
                          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                        />
                        <span>{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Course Duration <span className="required">*</span></label>
                <div className="radio-group">
                  {['3 Years', '4 Years', '5 Years'].map(duration => (
                    <label key={duration} className="radio-label">
                      <input
                        type="radio"
                        name="courseDuration"
                        value={duration}
                        checked={formData.courseDuration === duration}
                        onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                      />
                      <span>{duration}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="form-step" style={{ background: 'white', padding: '20px' }}>
              <h3 className="step-title">Additional Details</h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Upload your resume and add a cover letter to complete your application.
              </p>
              
              <div className="form-group">
                <label>CV/Resume Submission <span className="required">*</span></label>
                <p className="field-hint">Submit your resume in doc, docx, pdf</p>
                
                {/* Show existing resume if available */}
                {userData?.resumePath && !formData.resumeFile && (
                  <div style={{ 
                    padding: '16px', 
                    background: '#f0fdf4', 
                    border: '1px solid #86efac', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Check size={20} style={{ color: '#16a34a' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>
                          Resume already uploaded
                        </div>
                        <div style={{ fontSize: '12px', color: '#15803d' }}>
                          Your existing resume will be used for this application
                        </div>
                      </div>
                    </div>
                    <a
                      href={`${(process.env.REACT_APP_API_URL || 'http://localhost:4000/api').replace('/api', '')}${userData.resumePath}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: '#16a34a',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      View Resume
                    </a>
                  </div>
                )}
                
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="resume-upload" className="file-upload-label">
                    {formData.resumeFile ? (
                      <div className="file-selected">
                        <Check size={20} className="text-green-600" />
                        <span>{formData.resumeFile.name}</span>
                      </div>
                    ) : (
                      <div className="file-placeholder">
                        <Upload size={24} />
                        <span>
                          {userData?.resumePath 
                            ? 'Click to upload a different resume' 
                            : 'Click to upload or drag and drop'}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Cover Letter (Optional)</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Tell us why you're a great fit for this position..."
                  rows="6"
                />
              </div>

              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>
                    By registering for this opportunity, you agree to share the data mentioned in this form with the recruiter of this opportunity for further analysis, procedures, and updates. Your data will also be used to display for promotional purposes.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="quick-apply-footer">
          {currentStep > 1 && (
            <button onClick={handleBack} className="btn-secondary">
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          <div className="flex-grow" />
          {currentStep < 3 ? (
            <button onClick={handleNext} className="btn-primary">
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickApplyModal;
