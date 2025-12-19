import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Building, MapPin, DollarSign, Users, Globe, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import '../AddContentModal.css';
import './JobFormModal.css';
import ImageUpload from './ImageUpload';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const JobFormModal = ({ job, authUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: authUser?.company?.name || '',
    companyLogo: authUser?.company?.logo || '',
    bannerImage: '',
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    benefits: '',
    perks: [],
    jobType: 'full-time',
    experienceLevel: 'fresher',
    locationType: 'remote',
    location: authUser?.company?.headOffice || '',
    city: authUser?.city || '',
    state: authUser?.state || '',
    country: authUser?.country || '',
    salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
    applicationDeadline: '',
    applyLink: '',
    applyEmail: '',
    skills: [],
    categories: [],
    department: '',
    numberOfPositions: 1,
    media: [],
    companyDescription: authUser?.company?.aboutCompany || '',
    companyWebsite: authUser?.company?.website || '',
    companySocials: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    contactPerson: { name: '', email: '', phone: '' },
    status: 'open',
    featured: false,
    urgent: false,
    eligibility: [],
    faqs: [],
  });

  useEffect(() => {
    if (job) {
      // Format date for HTML date input (yyyy-MM-dd)
      let formattedDeadline = '';
      if (job.applicationDeadline) {
        const date = new Date(job.applicationDeadline);
        formattedDeadline = date.toISOString().split('T')[0];
      }
      
      setFormData({
        title: job.title || '',
        companyName: job.companyName || '',
        companyLogo: job.companyLogo || '',
        bannerImage: job.bannerImage || '',
        description: job.description || '',
        responsibilities: job.responsibilities || '',
        requirements: job.requirements || '',
        qualifications: job.qualifications || '',
        benefits: job.benefits || '',
        perks: job.perks || [],
        jobType: job.jobType || 'full-time',
        experienceLevel: job.experienceLevel || 'fresher',
        locationType: job.locationType || 'remote',
        location: job.location || '',
        city: job.city || '',
        state: job.state || '',
        country: job.country || '',
        salary: job.salary || { min: '', max: '', currency: 'USD', period: 'yearly' },
        applicationDeadline: formattedDeadline,
        applyLink: job.applyLink || '',
        applyEmail: job.applyEmail || '',
        skills: job.skills || [],
        categories: job.categories || [],
        department: job.department || '',
        numberOfPositions: job.numberOfPositions || 1,
        media: job.media || [],
        companyDescription: job.companyDescription || '',
        companyWebsite: job.companyWebsite || '',
        companySocials: job.companySocials || { linkedin: '', twitter: '', facebook: '', instagram: '' },
        contactPerson: job.contactPerson || { name: '', email: '', phone: '' },
        status: job.status || 'open',
        featured: job.featured || false,
        urgent: job.urgent || false,
        eligibility: job.eligibility || [],
        faqs: job.faqs || [],
      });
    }
  }, [job]);

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPerk, setNewPerk] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [newMedia, setNewMedia] = useState({ type: 'image', url: '', caption: '' });



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addPerk = () => {
    if (newPerk.trim()) {
      setFormData(prev => ({
        ...prev,
        perks: [...prev.perks, newPerk.trim()]
      }));
      setNewPerk('');
    }
  };

  const removePerk = (index) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
  };

  const addEligibility = () => {
    if (newEligibility.trim()) {
      setFormData(prev => ({
        ...prev,
        eligibility: [...prev.eligibility, newEligibility.trim()]
      }));
      setNewEligibility('');
    }
  };

  const removeEligibility = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibility: prev.eligibility.filter((_, i) => i !== index)
    }));
  };

  const addFAQ = () => {
    if (newFAQ.question.trim() && newFAQ.answer.trim()) {
      setFormData(prev => ({
        ...prev,
        faqs: [...prev.faqs, { ...newFAQ }]
      }));
      setNewFAQ({ question: '', answer: '' });
    }
  };

  const removeFAQ = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const addMedia = () => {
    if (newMedia.url.trim()) {
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, { ...newMedia }]
      }));
      setNewMedia({ type: 'image', url: '', caption: '' });
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.companyName || !formData.description) {
      toast.error('Please fill in all required fields (Title, Company Name, Description)');
      return;
    }
    

    
    setLoading(true);

    try {
      const url = job
        ? `${API_URL}/jobs/${job.id}`
        : `${API_URL}/jobs`;
      
      const method = job ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (job) {
          toast.success('Job updated successfully!');
        } else {
          // Show approval message for new jobs
          if (data.requiresApproval) {
            toast.success('Job posted successfully! It will be visible after admin approval.', {
              autoClose: 5000,
              style: {
                background: '#fff8e1',
                color: '#d97706',
                border: '1px solid #ffd600'
              }
            });
          } else {
            toast.success('Job created successfully!');
          }
        }
        onSuccess();
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.error || 'Failed to save job';
        toast.error(errorMessage);
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Job Details' },
    { id: 'company', label: 'Company Info' },
    { id: 'media', label: 'Media & Images' },
    { id: 'contact', label: 'Contact & Apply' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container job-form-modal">
        <div className="modal-header">
          <h2>{job ? 'Edit Job' : 'Create New Job'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-form modal-body">
          {currentTab === 'basic' && (
            <>
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the job role..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Job Type</label>
                  <select name="jobType" value={formData.jobType} onChange={handleChange}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience Level</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Positions</label>
                  <input
                    type="number"
                    name="numberOfPositions"
                    value={formData.numberOfPositions}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    Featured Job
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="urgent"
                      checked={formData.urgent}
                      onChange={handleChange}
                    />
                    Urgent Hiring
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('details')}>
                Next: Job Details
              </button>
            </div>
            </>
          )}

          {currentTab === 'details' && (
            <>
            <div className="form-section">
              <h3>Job Details</h3>

              <div className="form-group">
                <label>Responsibilities</label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows="4"
                  placeholder="List key responsibilities..."
                />
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="4"
                  placeholder="List requirements..."
                />
              </div>

              <div className="form-group">
                <label>Qualifications</label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Educational qualifications..."
                />
              </div>

              <div className="form-group">
                <label>Benefits</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows="4"
                  placeholder="List benefits..."
                />
              </div>

              <div className="form-group">
                <label>Eligibility Criteria</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.eligibility.map((criteria, index) => (
                      <span key={index} className="tag">
                        {criteria}
                        <button type="button" onClick={() => removeEligibility(index)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newEligibility}
                      onChange={(e) => setNewEligibility(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEligibility())}
                      placeholder="Add eligibility criteria (e.g. Bachelor's degree required)"
                    />
                    <button type="button" onClick={addEligibility} className="btn-add">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Perks</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.perks.map((perk, index) => (
                      <span key={index} className="tag">
                        {perk}
                        <button type="button" onClick={() => removePerk(index)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newPerk}
                      onChange={(e) => setNewPerk(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                      placeholder="Add perk (e.g. Health Insurance)"
                    />
                    <button type="button" onClick={addPerk} className="btn-add">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="tag">
                        {skill}
                        <button type="button" onClick={() => removeSkill(index)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add skill (e.g. React, Node.js)"
                    />
                    <button type="button" onClick={addSkill} className="btn-add">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.categories.map((category, index) => (
                      <span key={index} className="tag">
                        {category}
                        <button type="button" onClick={() => removeCategory(index)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      placeholder="Add category (e.g. Technology, Design)"
                    />
                    <button type="button" onClick={addCategory} className="btn-add">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Location Type</label>
                <select name="locationType" value={formData.locationType} onChange={handleChange}>
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Salary Range</label>
                <div className="salary-inputs">
                  <input
                    type="number"
                    value={formData.salary?.min || ''}
                    onChange={(e) => handleNestedChange('salary', 'min', e.target.value)}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={formData.salary?.max || ''}
                    onChange={(e) => handleNestedChange('salary', 'max', e.target.value)}
                    placeholder="Max"
                  />
                  <select
                    value={formData.salary?.currency || 'USD'}
                    onChange={(e) => handleNestedChange('salary', 'currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <select
                    value={formData.salary?.period || 'yearly'}
                    onChange={(e) => handleNestedChange('salary', 'period', e.target.value)}
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('basic')}>
                Back
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('company')}>
                Next: Company Info
              </button>
            </div>
            </>
          )}

          {currentTab === 'company' && (
            <>
            <div className="form-section">
              <h3>Company Information</h3>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell candidates about your company..."
                />
              </div>

              <div className="form-group">
                <label>Company Website</label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://company.com"
                />
              </div>

              <div className="form-group">
                <label>Company Social Media</label>
                <div className="social-inputs">
                  <input
                    type="url"
                    value={formData.companySocials?.linkedin || ''}
                    onChange={(e) => handleNestedChange('companySocials', 'linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="url"
                    value={formData.companySocials?.twitter || ''}
                    onChange={(e) => handleNestedChange('companySocials', 'twitter', e.target.value)}
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    value={formData.companySocials?.facebook || ''}
                    onChange={(e) => handleNestedChange('companySocials', 'facebook', e.target.value)}
                    placeholder="Facebook URL"
                  />
                  <input
                    type="url"
                    value={formData.companySocials?.instagram || ''}
                    onChange={(e) => handleNestedChange('companySocials', 'instagram', e.target.value)}
                    placeholder="Instagram URL"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('details')}>
                Back
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('media')}>
                Next: Media & Images
              </button>
            </div>
            </>
          )}

          {currentTab === 'media' && (
            <>
            <div className="form-section">
              <h3>Media & Images</h3>

              <ImageUpload
                label="Company Logo"
                value={formData.companyLogo}
                onChange={(url) => setFormData(prev => ({ ...prev, companyLogo: url }))}
                type="jobs"
                fieldName="image"
                previewClass="logo"
              />

              <ImageUpload
                label="Banner Image"
                value={formData.bannerImage}
                onChange={(url) => setFormData(prev => ({ ...prev, bannerImage: url }))}
                type="jobs"
                fieldName="image"
                previewClass="banner"
              />

              <div className="form-group">
                <label>Additional Media</label>
                <div className="media-list">
                  {formData.media.map((item, index) => (
                    <div key={index} className="media-item">
                      <span className="media-type">{item.type}</span>
                      <span className="media-url">{item.url}</span>
                      {item.caption && <span className="media-caption">{item.caption}</span>}
                      <button type="button" onClick={() => removeMedia(index)} className="btn-remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="media-input-group">
                  <select
                    value={newMedia.type}
                    onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  <input
                    type="url"
                    value={newMedia.url}
                    onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                    placeholder="Media URL"
                  />
                  <input
                    type="text"
                    value={newMedia.caption}
                    onChange={(e) => setNewMedia({ ...newMedia, caption: e.target.value })}
                    placeholder="Caption (optional)"
                  />
                  <button type="button" onClick={addMedia} className="btn-add">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('company')}>
                Back
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('contact')}>
                Next: Contact & Apply
              </button>
            </div>
            </>
          )}

          {currentTab === 'contact' && (
            <>
            <div className="form-section">
              <h3>Contact & Application</h3>

              <div className="form-group">
                <label>Application Link</label>
                <input
                  type="url"
                  name="applyLink"
                  value={formData.applyLink}
                  onChange={handleChange}
                  placeholder="https://company.com/apply"
                />
              </div>

              <div className="form-group">
                <label>Application Email</label>
                <input
                  type="email"
                  name="applyEmail"
                  value={formData.applyEmail}
                  onChange={handleChange}
                  placeholder="careers@company.com"
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <div className="contact-inputs">
                  <input
                    type="text"
                    value={formData.contactPerson?.name || ''}
                    onChange={(e) => handleNestedChange('contactPerson', 'name', e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={formData.contactPerson?.email || ''}
                    onChange={(e) => handleNestedChange('contactPerson', 'email', e.target.value)}
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={formData.contactPerson?.phone || ''}
                    onChange={(e) => handleNestedChange('contactPerson', 'phone', e.target.value)}
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('media')}>
                Back
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('faqs')}>
                Next: FAQs
              </button>
            </div>
            </>
          )}

          {currentTab === 'faqs' && (
            <>
            <div className="form-section">
              <h3>Frequently Asked Questions</h3>
              <p className="section-description">Add common questions and answers to help candidates understand the role better.</p>

              {/* Existing FAQs */}
              {formData.faqs.length > 0 && (
                <div className="faqs-list">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <div className="faq-header">
                        <h4>Q: {faq.question}</h4>
                        <button type="button" onClick={() => removeFAQ(index)} className="remove-btn">
                          <X size={16} />
                        </button>
                      </div>
                      <p className="faq-answer">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New FAQ */}
              <div className="form-group">
                <label>Add New FAQ</label>
                <div className="faq-input-group">
                  <input
                    type="text"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter question (e.g., What are the working hours?)"
                    className="faq-question-input"
                  />
                  <textarea
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter answer..."
                    rows="3"
                    className="faq-answer-input"
                  />
                  <button type="button" onClick={addFAQ} className="btn-add">
                    <Plus size={18} />
                    Add FAQ
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('contact')}>
                Back
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    {job ? 'Update Job' : 'Create Job'}
                  </>
                )}
              </button>
            </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
