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
    stages: [], // Recruitment stages
  });

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [newStage, setNewStage] = useState({
    title: '',
    type: 'assessment',
    deadline: '',
    assessmentLink: '',
    assessmentFile: null,
    submissionTypes: {
      githubLink: false,
      videoLink: false,
      pdfUpload: false
    },
    // Interview specific fields
    interviewLink: '',
    interviewDate: '',
    interviewTime: '',
    interviewDuration: ''
  });

  const [editingStageIndex, setEditingStageIndex] = useState(null);

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
        stages: internship.stages || [], // Add stages field
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

  const addStage = () => {
    if (newStage.title.trim()) {
      // Convert submissionTypes checkboxes to submissions array
      const submissions = [];
      if (newStage.submissionTypes.githubLink) {
        submissions.push({
          type: 'link',
          label: 'GitHub Repository Link',
          description: 'Share your GitHub repository link',
          required: true
        });
      }
      if (newStage.submissionTypes.videoLink) {
        submissions.push({
          type: 'link',
          label: 'Video Demonstration Link',
          description: 'Share a video link (YouTube, Loom, etc.)',
          required: true
        });
      }
      if (newStage.submissionTypes.pdfUpload) {
        submissions.push({
          type: 'document',
          label: 'PDF Document',
          description: 'Upload your document in PDF format',
          required: true
        });
      }

      const stageData = { 
        title: newStage.title,
        type: newStage.type,
        deadline: newStage.type === 'interview' ? null : newStage.deadline,
        assessmentLink: newStage.assessmentLink,
        assessmentFile: newStage.assessmentFile ? {
          url: newStage.assessmentFile,
          name: newStage.assessmentFile.split('/').pop()
        } : null,
        submissions: submissions,
        interviewLink: newStage.interviewLink,
        interviewDate: newStage.interviewDate,
        interviewTime: newStage.interviewTime,
        interviewDuration: newStage.interviewDuration
      };

      if (editingStageIndex !== null) {
        setFormData(prev => ({
          ...prev,
          stages: prev.stages.map((stage, idx) => 
            idx === editingStageIndex ? stageData : stage
          )
        }));
        setEditingStageIndex(null);
      } else {
        setFormData(prev => ({
          ...prev,
          stages: [...prev.stages, stageData]
        }));
      }

      setNewStage({
        title: '',
        type: 'assessment',
        deadline: '',
        assessmentLink: '',
        assessmentFile: null,
        submissionTypes: {
          githubLink: false,
          videoLink: false,
          pdfUpload: false
        },
        interviewLink: '',
        interviewDate: '',
        interviewTime: ''
      });
    }
  };

  const editStage = (index) => {
    const stage = formData.stages[index];
    setEditingStageIndex(index);
    setNewStage({
      title: stage.title || '',
      type: stage.type || 'assessment',
      deadline: stage.deadline || '',
      assessmentLink: stage.assessmentLink || '',
      assessmentFile: stage.assessmentFile?.url || null,
      submissionTypes: {
        githubLink: stage.submissions?.some(s => s.label.includes('GitHub')) || false,
        videoLink: stage.submissions?.some(s => s.label.includes('Video')) || false,
        pdfUpload: stage.submissions?.some(s => s.label.includes('PDF')) || false
      },
      interviewLink: stage.interviewLink || '',
      interviewDate: stage.interviewDate || '',
      interviewTime: stage.interviewTime || '',
      interviewDuration: stage.interviewDuration || ''
    });
  };

  const cancelEdit = () => {
    setEditingStageIndex(null);
    setNewStage({
      title: '',
      type: 'assessment',
      deadline: '',
      assessmentLink: '',
      assessmentFile: null,
      submissionTypes: {
        githubLink: false,
        videoLink: false,
        pdfUpload: false
      },
      interviewLink: '',
      interviewDate: '',
      interviewTime: ''
    });
  };

  const removeStage = (index) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
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
      console.log('📤 Sending internship data:', formData);
      console.log('📋 Eligibility being sent:', formData.eligibility);
      console.log('💰 Stipend being sent:', formData.stipend);
      
      // Set content to description if not provided
      const dataToSend = {
        ...formData,
        content: formData.description // Use description as content
      };
      
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
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log('📥 Server response:', data);

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
    { id: 'stages', label: 'Recruitment Stages' },
    { id: 'media', label: 'Media & Images' },
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
                  rows="5"
                  placeholder="Detailed description about the internship..."
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
              <button type="button" className="submit-button" onClick={() => setCurrentTab('stages')}>
                Next: Recruitment Stages
              </button>
            </div>
            </>
          )}

          {/* Recruitment Stages Tab - Same as JobFormModal */}
          {currentTab === 'stages' && (
            <>
            <div className="form-section">
              <h3>Recruitment Stages (Optional)</h3>
              <p className="section-description">
                Add assessment rounds, interviews, or other stages in your recruitment process. 
                Candidates will see these stages and their deadlines.
              </p>

              {/* Existing Stages */}
              {formData.stages.length > 0 && (
                <div className="stages-list">
                  {formData.stages.map((stage, index) => (
                    <div key={index} className="stage-item-card">
                      <div className="stage-header">
                        <div className="stage-title-row">
                          <span className="stage-number-badge">Stage {index + 1}</span>
                          <span className={`stage-type-badge ${stage.type}`}>
                            {stage.type === 'assessment' ? '📝 Assessment' : 
                             stage.type === 'interview' ? '💼 Interview' : 
                             '🎯 Final Round'}
                          </span>
                          <div className="stage-actions">
                            <button type="button" onClick={() => editStage(index)} className="edit-btn">
                              Edit
                            </button>
                            <button type="button" onClick={() => removeStage(index)} className="remove-btn">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h4>{stage.title}</h4>
                      </div>
                      <div className="stage-details">
                        {stage.deadline && stage.type !== 'interview' && (
                          <div className="stage-detail-item">
                            <strong>Deadline:</strong> {new Date(stage.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {stage.assessmentLink && (
                          <div className="stage-detail-item">
                            <strong>Assessment Link:</strong> 
                            <a href={stage.assessmentLink} target="_blank" rel="noopener noreferrer">
                              {stage.assessmentLink}
                            </a>
                          </div>
                        )}
                        {stage.assessmentFile && (
                          <div className="stage-detail-item">
                            <strong>Assessment File:</strong> {stage.assessmentFile.name || 'Uploaded'}
                          </div>
                        )}
                        {stage.interviewLink && (
                          <div className="stage-detail-item">
                            <strong>Interview Link:</strong> 
                            <a href={stage.interviewLink} target="_blank" rel="noopener noreferrer">
                              {stage.interviewLink}
                            </a>
                          </div>
                        )}
                        {stage.interviewDate && (
                          <div className="stage-detail-item">
                            <strong>Interview Date:</strong> {new Date(stage.interviewDate).toLocaleDateString()}
                          </div>
                        )}
                        {stage.interviewTime && (
                          <div className="stage-detail-item">
                            <strong>Interview Time:</strong> {stage.interviewTime}
                          </div>
                        )}
                        {stage.submissions && stage.submissions.length > 0 && (
                          <div className="stage-detail-item">
                            <strong>Required Submissions:</strong>
                            <div className="submission-badges">
                              {stage.submissions.map((sub, idx) => (
                                <span key={idx} className="submission-badge">
                                  {sub.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Stage */}
              <div className="form-group">
                <label>{editingStageIndex !== null ? 'Edit Stage' : 'Add New Stage'}</label>
                <div className="stage-input-group">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Stage Type *</label>
                      <select
                        value={newStage.type}
                        onChange={(e) => setNewStage(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="assessment">📝 Assessment Round</option>
                        <option value="interview">💼 Interview Round</option>
                        <option value="final">🎯 Final Round</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stage Title *</label>
                      <input
                        type="text"
                        value={newStage.title}
                        onChange={(e) => setNewStage(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Technical Assessment, HR Interview"
                      />
                    </div>
                  </div>

                  {/* Deadline - Only for non-interview stages */}
                  {newStage.type !== 'interview' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Deadline</label>
                        <input
                          type="date"
                          value={newStage.deadline}
                          onChange={(e) => setNewStage(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {newStage.type === 'assessment' && (
                    <>
                      <div className="form-group">
                        <label>Assessment Link (Optional)</label>
                        <input
                          type="url"
                          value={newStage.assessmentLink}
                          onChange={(e) => setNewStage(prev => ({ ...prev, assessmentLink: e.target.value }))}
                          placeholder="https://forms.google.com/... or any assessment platform link"
                        />
                      </div>

                      <div className="form-group">
                        <label>Or Upload Assessment PDF (Optional)</label>
                        <input
                          type="url"
                          value={newStage.assessmentFile || ''}
                          onChange={(e) => setNewStage(prev => ({ ...prev, assessmentFile: e.target.value }))}
                          placeholder="Enter PDF URL or upload to cloud and paste link"
                        />
                        <p className="field-hint">
                          💡 Upload your PDF to Google Drive, Dropbox, or any cloud storage and paste the public link here
                        </p>
                      </div>

                      <div className="form-group">
                        <label>What should candidates submit?</label>
                        <div className="submission-checkboxes">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newStage.submissionTypes.githubLink}
                              onChange={(e) => setNewStage(prev => ({
                                ...prev,
                                submissionTypes: { ...prev.submissionTypes, githubLink: e.target.checked }
                              }))}
                            />
                            <span>💻 GitHub Link</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newStage.submissionTypes.videoLink}
                              onChange={(e) => setNewStage(prev => ({
                                ...prev,
                                submissionTypes: { ...prev.submissionTypes, videoLink: e.target.checked }
                              }))}
                            />
                            <span>🎥 Video Link</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newStage.submissionTypes.pdfUpload}
                              onChange={(e) => setNewStage(prev => ({
                                ...prev,
                                submissionTypes: { ...prev.submissionTypes, pdfUpload: e.target.checked }
                              }))}
                            />
                            <span>📄 PDF Upload</span>
                          </label>
                        </div>
                        <p className="field-hint">
                          ✅ Select what candidates need to submit after completing the assessment
                        </p>
                      </div>
                    </>
                  )}

                  {newStage.type === 'interview' && (
                    <>
                      <div className="form-group">
                        <label>Interview Link *</label>
                        <input
                          type="url"
                          value={newStage.interviewLink}
                          onChange={(e) => setNewStage(prev => ({ ...prev, interviewLink: e.target.value }))}
                          placeholder="https://meet.google.com/... or Zoom link"
                        />
                        <p className="field-hint">
                          💡 Provide the video call link for the interview (Google Meet, Zoom, Teams, etc.)
                        </p>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Interview Date *</label>
                          <input
                            type="date"
                            value={newStage.interviewDate}
                            onChange={(e) => setNewStage(prev => ({ ...prev, interviewDate: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Interview Time *</label>
                          <input
                            type="time"
                            value={newStage.interviewTime}
                            onChange={(e) => setNewStage(prev => ({ ...prev, interviewTime: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Interview Duration (minutes) *</label>
                          <input
                            type="number"
                            min="15"
                            step="15"
                            placeholder="e.g., 30, 45, 60"
                            value={newStage.interviewDuration}
                            onChange={(e) => setNewStage(prev => ({ ...prev, interviewDuration: e.target.value }))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="stage-form-actions">
                    {editingStageIndex !== null && (
                      <button type="button" onClick={cancelEdit} className="btn-cancel">
                        Cancel
                      </button>
                    )}
                    <button type="button" onClick={addStage} className="btn-add">
                      <Plus size={18} />
                      {editingStageIndex !== null ? 'Update Stage' : 'Add Stage'}
                    </button>
                  </div>
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
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('stages')}>
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
              <button type="button" className="cancel-button" onClick={() => setCurrentTab('media')}>
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
