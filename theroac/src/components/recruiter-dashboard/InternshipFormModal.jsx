import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Building, MapPin, DollarSign, Users, Globe, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import ImageUpload from './ImageUpload';
import '../AddContentModal.css';
import './JobFormModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const InternshipFormModal = ({ internship, authUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    contentType: 'internship',
    category: 'internships',
    tags: [],
    status: 'published',
    featuredImage: '',
    thumbnailImage: '',
    bannerImage: '',
    media: [],
    
    // Internship specific - Prefilled from authUser
    companyName: authUser?.company?.name || '',
    companyLogo: authUser?.company?.logo || '',
    companyDescription: authUser?.company?.aboutCompany || '',
    position: '',
    duration: '',
    stipend: { min: '', max: '', currency: 'USD', period: 'monthly' },
    location: authUser?.company?.headOffice || '',
    locationType: 'remote',
    applicationDeadline: '',
    applyLink: '',
    applyEmail: '',
    requirements: '',
    responsibilities: '',
    skills: [],
    benefits: '',
    numberOfPositions: 1,
    featured: false,
    eligibility: [],
    faqs: [],
  });

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });

  useEffect(() => {
    if (internship) {
      // Format date for HTML date input (yyyy-MM-dd)
      let formattedDeadline = '';
      if (internship.applicationDeadline) {
        const date = new Date(internship.applicationDeadline);
        formattedDeadline = date.toISOString().split('T')[0];
      }
      
      setFormData({
        title: internship.title || '',
        description: internship.description || '',
        content: internship.content || '',
        contentType: internship.contentType || 'internship',
        category: internship.category || 'internships',
        tags: internship.tags || [],
        status: internship.status || 'published',
        featuredImage: internship.featuredImage || '',
        thumbnailImage: internship.thumbnailImage || '',
        bannerImage: internship.bannerImage || '',
        media: internship.media || [],
        companyName: internship.companyName || '',
        companyLogo: internship.companyLogo || '',
        companyDescription: internship.companyDescription || '',
        position: internship.position || '',
        duration: internship.duration || '',
        stipend: internship.stipend || { min: '', max: '', currency: 'USD', period: 'monthly' },
        location: internship.location || '',
        locationType: internship.locationType || 'remote',
        applicationDeadline: formattedDeadline,
        applyLink: internship.applyLink || '',
        applyEmail: internship.applyEmail || '',
        requirements: internship.requirements || '',
        responsibilities: internship.responsibilities || '',
        skills: internship.skills || [],
        benefits: internship.benefits || '',
        numberOfPositions: internship.numberOfPositions || 1,
        featured: internship.featured || false,
        eligibility: internship.eligibility || [],
        faqs: internship.faqs || [],
      });
    }
  }, [internship]);

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

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.companyName || !formData.description || !formData.content) {
      toast.error('Please fill in all required fields (Title, Company Name, Description, Content)');
      return;
    }
    
    setLoading(true);

    try {
      const url = internship
        ? `${API_URL}/hub-content/${internship.id}`
        : `${API_URL}/hub-content`;
      
      const method = internship ? 'PUT' : 'POST';

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
        toast.success(internship ? 'Internship updated successfully!' : 'Internship created successfully!');
        onSuccess();
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.error || 'Failed to save internship';
        toast.error(errorMessage);
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Error saving internship:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Internship Details' },
    { id: 'company', label: 'Company Info' },
    { id: 'media', label: 'Media & Images' },
    { id: 'contact', label: 'Contact & Apply' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container job-form-modal">
        <div className="modal-header">
          <h2>{internship ? 'Edit Internship' : 'Create New Internship'}</h2>
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
                <label>Internship Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Internship - Software Development"
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
                  <label>Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering Intern"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Detailed Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Detailed information about the internship..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3 months, 6 weeks"
                    required
                  />
                </div>
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  Featured Internship
                </label>
              </div>
            </div>
            <div className="modal-actions modal-footer">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="submit-button" onClick={() => setCurrentTab('details')}>
                Next: Internship Details
              </button>
            </div>
            </>
          )}

          {currentTab === 'details' && (
            <>
            <div className="form-section">
              <h3>Internship Details</h3>

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
                  placeholder="List requirements and qualifications..."
                />
              </div>

              <div className="form-group">
                <label>Perks & Benefits</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List perks & benefits (certificate, mentorship, etc.)..."
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
                      placeholder="Add eligibility criteria (e.g. Currently pursuing degree)"
                    />
                    <button type="button" onClick={addEligibility} className="btn-add">
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
                      placeholder="Add skill (e.g. Python, React)"
                    />
                    <button type="button" onClick={addSkill} className="btn-add">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag (e.g. internship, tech, remote)"
                    />
                    <button type="button" onClick={addTag} className="btn-add">
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

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>

              <div className="form-group">
                <label>Stipend Range</label>
                <div className="salary-inputs">
                  <input
                    type="number"
                    value={formData.stipend?.min || ''}
                    onChange={(e) => handleNestedChange('stipend', 'min', e.target.value)}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={formData.stipend?.max || ''}
                    onChange={(e) => handleNestedChange('stipend', 'max', e.target.value)}
                    placeholder="Max"
                  />
                  <select
                    value={formData.stipend?.currency || 'USD'}
                    onChange={(e) => handleNestedChange('stipend', 'currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <select
                    value={formData.stipend?.period || 'monthly'}
                    onChange={(e) => handleNestedChange('stipend', 'period', e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="total">Total</option>
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
                type="internships"
                fieldName="image"
              />

              <ImageUpload
                label="Banner Image"
                value={formData.bannerImage}
                onChange={(url) => setFormData(prev => ({ ...prev, bannerImage: url }))}
                type="internships"
                fieldName="image"
                previewClass="banner"
              />

              <ImageUpload
                label="Thumbnail Image"
                value={formData.thumbnailImage}
                onChange={(url) => setFormData(prev => ({ ...prev, thumbnailImage: url }))}
                type="internships"
                fieldName="image"
              />

              <ImageUpload
                label="Featured Image"
                value={formData.featuredImage}
                onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                type="internships"
                fieldName="image"
              />

              <div className="form-group">
                <label>Additional Media</label>
                <p className="form-note">
                  Additional media files can be uploaded using the image upload fields above. 
                  For videos, please contact support for assistance.
                </p>
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
                  placeholder="internships@company.com"
                />
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
              <p className="section-description">Add common questions and answers to help candidates understand the internship better.</p>

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
                    {internship ? 'Update Internship' : 'Create Internship'}
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

export default InternshipFormModal;
