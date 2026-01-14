import React, { useState, useRef } from 'react';
import { X, Upload, Link, FileText, Video, Code, Award } from 'lucide-react';
import apiService from '../services/api';
import './StageSubmissionModal.css';

const StageSubmissionModal = ({ 
    isOpen, 
    onClose, 
    stage, 
    stageIndex, 
    eventId, 
    eventTitle,
    onSubmissionSuccess 
}) => {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRefs = useRef({});

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setFormData({});
            setFiles({});
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen || !stage) return null;

    const handleInputChange = (submissionType, value) => {
        setFormData(prev => ({
            ...prev,
            [submissionType]: value
        }));
        
        // Clear error when user starts typing
        if (errors[submissionType]) {
            setErrors(prev => ({
                ...prev,
                [submissionType]: null
            }));
        }
    };

    const handleFileChange = (submissionType, file) => {
        if (file) {
            setFiles(prev => ({
                ...prev,
                [submissionType]: file
            }));
            
            setFormData(prev => ({
                ...prev,
                [submissionType]: file.name
            }));

            // Clear error when file is selected
            if (errors[submissionType]) {
                setErrors(prev => ({
                    ...prev,
                    [submissionType]: null
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate project title (always required)
        if (!formData.projectTitle || formData.projectTitle.trim() === '') {
            newErrors.projectTitle = 'Project title is required';
        }
        
        // Validate project description (always required)
        if (!formData.projectDescription || formData.projectDescription.trim() === '') {
            newErrors.projectDescription = 'Project description is required';
        }
        
        // Validate other submission requirements
        stage.submissions?.forEach(submission => {
            if (submission.required) {
                const value = formData[submission.type];
                if (!value || value.trim() === '') {
                    newErrors[submission.type] = `${submission.label || submission.type} is required`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Create FormData for file uploads
            const submissionData = new FormData();
            
            // Add text fields
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'string') {
                    submissionData.append(key, formData[key]);
                }
            });
            
            // Add files
            Object.keys(files).forEach(key => {
                submissionData.append(key, files[key]);
            });
            
            // Add stage info
            submissionData.append('stageId', stageIndex);
            submissionData.append('stageName', stage.title || `Round ${stageIndex + 1}`);
            
            // Submit to API
            await apiService.submitStageSubmission(eventId, stageIndex, submissionData);
            
            // Success callback
            if (onSubmissionSuccess) {
                onSubmissionSuccess(stageIndex);
            }
            
            alert(`Successfully submitted for ${stage.title || `Round ${stageIndex + 1}`}!`);
            onClose();
            
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Failed to submit: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSubmissionField = (submission, index) => {
        const { type, label, description, required } = submission;
        const fieldId = `${type}_${index}`;
        const value = formData[type] || '';
        const error = errors[type];

        switch (type.toLowerCase()) {
            case 'ppt':
            case 'presentation':
            case 'pdf':
            case 'document':
                return (
                    <div key={index} className="stage-submission-field">
                        <label htmlFor={fieldId} className="stage-field-label">
                            <Upload size={18} />
                            {label || 'Upload Document'}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <div className="stage-file-upload-area">
                            <input
                                type="file"
                                id={fieldId}
                                ref={el => fileInputRefs.current[type] = el}
                                onChange={(e) => handleFileChange(type, e.target.files[0])}
                                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip"
                                className="stage-file-input"
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRefs.current[type]?.click()}
                                className="stage-file-upload-btn"
                            >
                                <Upload size={20} />
                                {value ? 'Change File' : 'Choose File'}
                            </button>
                            {value && <span className="stage-file-name">{value}</span>}
                        </div>
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );

            case 'github':
            case 'github-link':
            case 'link':
                return (
                    <div key={index} className="stage-submission-field">
                        <label htmlFor={fieldId} className="stage-field-label">
                            <Link size={18} />
                            {label || 'GitHub Link'}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <input
                            type="url"
                            id={fieldId}
                            value={value}
                            onChange={(e) => handleInputChange(type, e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className={`stage-field-input ${error ? 'error' : ''}`}
                        />
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );

            case 'demo-video':
            case 'video':
                return (
                    <div key={index} className="stage-submission-field">
                        <label htmlFor={fieldId} className="stage-field-label">
                            <Video size={18} />
                            {label || 'Demo Video Link'}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <input
                            type="url"
                            id={fieldId}
                            value={value}
                            onChange={(e) => handleInputChange(type, e.target.value)}
                            placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                            className={`stage-field-input ${error ? 'error' : ''}`}
                        />
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );

            case 'quiz':
                return (
                    <div key={index} className="stage-submission-field">
                        <label className="stage-field-label">
                            <Award size={18} />
                            {label || 'Quiz'}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <div className="stage-quiz-section">
                            <p className="stage-quiz-info">Complete the quiz to proceed with this stage.</p>
                            <button
                                type="button"
                                className="stage-quiz-btn"
                                onClick={() => {
                                    // TODO: Open quiz modal or navigate to quiz page
                                    alert('Quiz functionality will be implemented soon!');
                                }}
                            >
                                <Award size={16} />
                                Start Quiz
                            </button>
                        </div>
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );

            case 'code':
                return (
                    <div key={index} className="stage-submission-field">
                        <label htmlFor={fieldId} className="stage-field-label">
                            <Code size={18} />
                            {label || 'Code Submission'}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <textarea
                            id={fieldId}
                            value={value}
                            onChange={(e) => handleInputChange(type, e.target.value)}
                            placeholder="Paste your code here or provide a link to your code repository..."
                            className={`stage-field-textarea ${error ? 'error' : ''}`}
                            rows="6"
                        />
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );

            default:
                return (
                    <div key={index} className="stage-submission-field">
                        <label htmlFor={fieldId} className="stage-field-label">
                            <FileText size={18} />
                            {label || type}
                            {required && <span className="required">*</span>}
                        </label>
                        {description && <p className="stage-field-description">{description}</p>}
                        
                        <input
                            type="text"
                            id={fieldId}
                            value={value}
                            onChange={(e) => handleInputChange(type, e.target.value)}
                            placeholder={`Enter your ${label || type}...`}
                            className={`stage-field-input ${error ? 'error' : ''}`}
                        />
                        {error && <span className="stage-field-error">{error}</span>}
                    </div>
                );
        }
    };

    return (
        <div className="stage-submission-modal-overlay" onClick={onClose}>
            <div className="stage-submission-modal" onClick={(e) => e.stopPropagation()}>
                <div className="stage-modal-header">
                    <div className="stage-modal-title-section">
                        <h2 className="stage-modal-title">
                            Submit for {stage.title || `Round ${stageIndex + 1}`}
                        </h2>
                        <p className="stage-modal-subtitle">{eventTitle}</p>
                    </div>
                    <button className="stage-modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="stage-modal-body">
                    {stage.description && (
                        <div className="stage-submission-info">
                            <p>{stage.description}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="stage-submission-form">
                        <div className="stage-form-fields">
                            {/* Project Title Field - Always show for team submissions */}
                            <div className="stage-submission-field">
                                <label htmlFor="projectTitle" className="stage-field-label">
                                    <Award size={18} />
                                    Project Title
                                    <span className="required">*</span>
                                </label>
                                <p className="stage-field-description">Give your project a catchy and descriptive title</p>
                                
                                <input
                                    type="text"
                                    id="projectTitle"
                                    value={formData.projectTitle || ''}
                                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                                    placeholder="e.g., Smart Healthcare Assistant, EcoTrack - Carbon Footprint Tracker"
                                    className={`stage-field-input ${errors.projectTitle ? 'error' : ''}`}
                                />
                                {errors.projectTitle && <span className="stage-field-error">{errors.projectTitle}</span>}
                            </div>

                            {/* Project Description Field */}
                            <div className="stage-submission-field">
                                <label htmlFor="projectDescription" className="stage-field-label">
                                    <FileText size={18} />
                                    Project Description
                                    <span className="required">*</span>
                                </label>
                                <p className="stage-field-description">Briefly describe what your project does and its key features</p>
                                
                                <textarea
                                    id="projectDescription"
                                    value={formData.projectDescription || ''}
                                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                                    placeholder="Describe your project idea, key features, target audience, and how it solves a problem..."
                                    className={`stage-field-textarea ${errors.projectDescription ? 'error' : ''}`}
                                    rows="4"
                                />
                                {errors.projectDescription && <span className="stage-field-error">{errors.projectDescription}</span>}
                            </div>

                            {stage.submissions?.map((submission, index) => 
                                renderSubmissionField(submission, index)
                            )}
                        </div>

                        <div className="stage-form-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="stage-cancel-btn"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="stage-submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StageSubmissionModal;