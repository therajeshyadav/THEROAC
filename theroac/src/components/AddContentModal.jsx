import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { X, Plus, Calendar, MapPin, DollarSign, Clock, Users, Building } from 'lucide-react';
import './AddContentModal.css';

const AddContentModal = ({ isOpen, onClose, type, authUser, onSuccess }) => {
    // Get company info from authUser for prefilling
    const getInitialFormData = () => {
       
        const companyName = authUser?.company?.name || '';
        const companyLogo = authUser?.company?.logo || '';
        const location = authUser?.company?.headOffice || '';
        
    
        
        return {
        title: '',
        description: '',
        company: companyName,
        companyLogo: companyLogo,
        location: location,
        salary: '',
        requirements: '',
        benefits: '',
        jobType: 'full-time',
        experienceLevel: 'fresher',
        // Event specific fields
        date: '',
        time: '',
        venue: '',
        capacity: '',
        registrationDeadline: '',
        // ROAC Talent Prime Hub specific fields
        category: 'career-tips',
        content: '',
        tags: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form with prefilled data when modal opens
    useEffect(() => {
        if (isOpen && authUser) {
            
            const initialData = getInitialFormData();
           
            setFormData(initialData);
            setErrors({});
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (type === 'job') {
            if (!formData.company.trim()) {
                newErrors.company = 'Company is required';
            }
            if (!formData.location.trim()) {
                newErrors.location = 'Location is required';
            }
        }

        if (type === 'event') {
            if (!formData.date) {
                newErrors.date = 'Date is required';
            }
            if (!formData.time) {
                newErrors.time = 'Time is required';
            }
            if (!formData.venue.trim()) {
                newErrors.venue = 'Venue is required';
            }
        }

        if (type === 'hub-content') {
            if (!formData.content.trim()) {
                newErrors.content = 'Content is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let response;

            if (type === 'job') {
                response = await apiService.createJob({
                    title: formData.title,
                    description: formData.description,
                    company: formData.company,
                    companyLogo: formData.companyLogo,
                    location: formData.location,
                    salary: formData.salary,
                    requirements: formData.requirements.split('\n').filter(req => req.trim()),
                    benefits: formData.benefits.split('\n').filter(benefit => benefit.trim()),
                    jobType: formData.jobType,
                    experienceLevel: formData.experienceLevel
                });
            } else if (type === 'event') {
                response = await apiService.createEvent({
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    time: formData.time,
                    venue: formData.venue,
                    capacity: parseInt(formData.capacity) || null,
                    registrationDeadline: formData.registrationDeadline,

                });
            } else if (type === 'hub-content') {
                response = await apiService.createHubContent({
                    title: formData.title,
                    description: formData.description,
                    content: formData.content,
                    category: formData.category,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                });
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                company: '',
                companyLogo: '',
                location: '',
                salary: '',
                requirements: '',
                benefits: '',
                jobType: 'full-time',
                experienceLevel: 'fresher',
                date: '',
                time: '',
                venue: '',
                capacity: '',
                registrationDeadline: '',
                category: 'career-tips',
                content: '',
                tags: ''
            });

            onSuccess && onSuccess(response);
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to create content' });
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (type) {
            case 'job': return 'Add New Job';
            case 'event': return 'Add New Event';
            case 'hub-content': return 'Add Career Insight to ROAC Prime Hub';
            default: return 'Add Content';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{getModalTitle()}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={errors.title ? 'error' : ''}
                            placeholder={type === 'job' ? 'e.g. Senior Software Engineer' :
                                type === 'event' ? 'e.g. React Workshop' :
                                    'e.g. 5 Tips for Technical Interviews'}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={errors.description ? 'error' : ''}
                            rows="4"
                            placeholder="Provide a detailed description..."
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    {type === 'job' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="company">Company *</label>
                                    <div className="input-with-icon">
                                        <Building className="w-4 h-4" />
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className={errors.company ? 'error' : ''}
                                            placeholder="Company name"
                                        />
                                    </div>
                                    {errors.company && <span className="error-message">{errors.company}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Location *</label>
                                    <div className="input-with-icon">
                                        <MapPin className="w-4 h-4" />
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={errors.location ? 'error' : ''}
                                            placeholder="e.g. San Francisco, CA"
                                        />
                                    </div>
                                    {errors.location && <span className="error-message">{errors.location}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="companyLogo">Company Logo URL</label>
                                <input
                                    type="url"
                                    id="companyLogo"
                                    name="companyLogo"
                                    value={formData.companyLogo}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="salary">Salary</label>
                                    <div className="input-with-icon">
                                        <DollarSign className="w-4 h-4" />
                                        <input
                                            type="text"
                                            id="salary"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleInputChange}
                                            placeholder="e.g. $80,000 - $120,000"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="jobType">Job Type</label>
                                    <select
                                        id="jobType"
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="experienceLevel">Experience Level</label>
                                <select
                                    id="experienceLevel"
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleInputChange}
                                >
                                    <option value="fresher">Fresher</option>
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior Level</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="requirements">Requirements (one per line)</label>
                                <textarea
                                    id="requirements"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience&#10;Strong problem-solving skills"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="benefits">Perks & Benefits (one per line)</label>
                                <textarea
                                    id="benefits"
                                    name="benefits"
                                    value={formData.benefits}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Health insurance&#10;401k matching&#10;Flexible work hours"
                                />
                            </div>
                        </>
                    )}

                    {type === 'event' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date">Date *</label>
                                    <div className="input-with-icon">
                                        <Calendar className="w-4 h-4" />
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className={errors.date ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.date && <span className="error-message">{errors.date}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="time">Time *</label>
                                    <div className="input-with-icon">
                                        <Clock className="w-4 h-4" />
                                        <input
                                            type="time"
                                            id="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className={errors.time ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.time && <span className="error-message">{errors.time}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="venue">Venue *</label>
                                <div className="input-with-icon">
                                    <MapPin className="w-4 h-4" />
                                    <input
                                        type="text"
                                        id="venue"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleInputChange}
                                        className={errors.venue ? 'error' : ''}
                                        placeholder="e.g. Tech Hub Conference Room A"
                                    />
                                </div>
                                {errors.venue && <span className="error-message">{errors.venue}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="capacity">Capacity</label>
                                    <div className="input-with-icon">
                                        <Users className="w-4 h-4" />
                                        <input
                                            type="number"
                                            id="capacity"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                </div>


                            </div>

                            <div className="form-group">
                                <label htmlFor="registrationDeadline">Registration Deadline</label>
                                <input
                                    type="date"
                                    id="registrationDeadline"
                                    name="registrationDeadline"
                                    value={formData.registrationDeadline}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </>
                    )}

                    {type === 'hub-content' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="career-tips">Career Tips</option>
                                    <option value="interview-prep">Interview Preparation</option>
                                    <option value="skill-development">Skill Development</option>
                                    <option value="industry-insights">Industry Insights</option>
                                    <option value="networking">Networking</option>
                                    <option value="resume-tips">Resume Tips</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">Content *</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    className={errors.content ? 'error' : ''}
                                    rows="6"
                                    placeholder="Write your detailed content here..."
                                />
                                {errors.content && <span className="error-message">{errors.content}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g. career, interview, tips, technology"
                                />
                            </div>
                        </>
                    )}

                    {errors.submit && (
                        <div className="error-message submit-error">
                            {errors.submit}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="loading-spinner small"></div>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create {type === 'job' ? 'Job' : type === 'event' ? 'Event' : 'Content'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContentModal;