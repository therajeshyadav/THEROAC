import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Calendar, User, FileText, Upload, X } from 'lucide-react';
import '../StepStyles.css';

const AdditionalInfoStep = ({ formData, setFormData, contentType }) => {
  const [showImportantDateModal, setShowImportantDateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [dateForm, setDateForm] = useState({ title: '', date: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', mobile: '' });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isOpportunity = contentType === 'opportunity';

  const handleAddImportantDate = () => {
    if (dateForm.title && dateForm.date) {
      const currentDates = formData.importantDates || [];
      handleChange('importantDates', [...currentDates, { ...dateForm, id: Date.now() }]);
      setDateForm({ title: '', date: '' });
      setShowImportantDateModal(false);
    }
  };

  const handleAddContact = () => {
    if (contactForm.name && (contactForm.email || contactForm.mobile)) {
      const currentContacts = formData.contacts || [];
      handleChange('contacts', [...currentContacts, { ...contactForm, id: Date.now() }]);
      setContactForm({ name: '', email: '', mobile: '' });
      setShowContactModal(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const currentAttachments = formData.attachments || [];
      handleChange('attachments', [...currentAttachments, { name: file.name, size: file.size, id: Date.now() }]);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const currentGallery = formData.gallery || [];
      const newImages = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      }));
      handleChange('gallery', [...currentGallery, ...newImages]);
    }
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Additional Information</h2>
        <p className="unified-step-description">
          Manage additional details of your {isOpportunity ? 'opportunity' : 'job'} listing, including email preferences, important dates, recruiter contacts, documents, and FAQs.
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Email Notifications */}
        <div className="unified-form-group unified-full-width">
          <div className="unified-checkbox-group">
            <input
              type="checkbox"
              id="emailNotifications"
              className="unified-checkbox-input"
              checked={formData.emailNotifications !== false}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
            />
            <label htmlFor="emailNotifications" className="unified-checkbox-label">
              Receive email notifications for each new application
            </label>
          </div>
        </div>

        <div className="unified-form-group unified-full-width">
          <div className="unified-checkbox-group">
            <input
              type="checkbox"
              id="replyToEmail"
              className="unified-checkbox-input"
              checked={formData.replyToEmail || false}
              onChange={(e) => handleChange('replyToEmail', e.target.checked)}
            />
            <label htmlFor="replyToEmail" className="unified-checkbox-label">
              Add my email in Reply to in emails sent from ROAC
            </label>
          </div>
        </div>

        {/* Important Dates Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0, marginBottom: '0.25rem' }}>
                Important dates
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                Add important dates in this section like Interview dates, training Program Start Date etc. (max. 15)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowImportantDateModal(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 214, 0, 0.1)',
                border: '1px solid #FFD600',
                color: '#FFD600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%',
              background: 'rgba(255, 193, 7, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ color: '#FFC107', fontSize: '0.9rem', fontWeight: 'bold' }}>i</span>
            </div>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 193, 7, 0.9)', 
              margin: 0,
              lineHeight: '1.5'
            }}>
              Registration deadline will be shown by default under important dates. Hence, you may not write it here explicitly.
            </p>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0, marginBottom: '0.25rem' }}>
                Contact Info
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                Add contact details of key persons related to this {isOpportunity ? 'opportunity' : 'internship'} for candidate inquiries or assistance.
              </p>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%',
              background: 'rgba(255, 193, 7, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ color: '#FFC107', fontSize: '0.9rem', fontWeight: 'bold' }}>i</span>
            </div>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 193, 7, 0.9)', 
              margin: 0,
              lineHeight: '1.5'
            }}>
              At least one contact detail (email or phone) is required
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#FFD600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = '#FFD600';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <Plus size={20} /> Add Contact
          </button>

          <div className="unified-checkbox-group" style={{ marginTop: '1rem' }}>
            <input
              type="checkbox"
              id="hideContact"
              className="unified-checkbox-input"
              checked={formData.hideContact || false}
              onChange={(e) => handleChange('hideContact', e.target.checked)}
            />
            <label htmlFor="hideContact" className="unified-checkbox-label">
              Hide contact detail(s) from the {isOpportunity ? 'opportunity' : 'internship'} page
            </label>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0, marginBottom: '0.25rem' }}>
              Attachments
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              Upload supporting documents for this {isOpportunity ? 'opportunity' : 'internship'}, such as instructions, additional guidelines or reference documents
            </p>
          </div>

          <label htmlFor="attachment-upload">
            <input
              id="attachment-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#FFD600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#FFD600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <FileText size={20} /> Browse file
            </div>
          </label>
        </div>

        {/* Upload Gallery Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0, marginBottom: '0.25rem' }}>
              Upload gallery
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              You can upload images to show the work culture, office infrastructure, etc.
            </p>
          </div>

          <label htmlFor="gallery-upload">
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleGalleryUpload}
            />
            <div style={{
              width: '120px',
              height: '120px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = '#FFD600';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            >
              <Plus size={32} style={{ color: '#FFD600' }} />
            </div>
          </label>
        </div>

        {/* Social Links */}
        {/* <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '1rem' }}>
            Social Links
          </h3>
        </div> */}

        {/* <div className="unified-form-group">
          <label className="unified-form-label">Website URL</label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://company.com"
            value={formData.websiteUrl || ''}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
          />
        </div> */}
{/* 
        <div className="unified-form-group">
          <label className="unified-form-label">LinkedIn URL</label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://linkedin.com/company/..."
            value={formData.linkedinUrl || ''}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
          />
        </div> */}
{/* 
        <div className="unified-form-group">
          <label className="unified-form-label">Twitter/X URL</label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://twitter.com/..."
            value={formData.twitterUrl || ''}
            onChange={(e) => handleChange('twitterUrl', e.target.value)}
          />
        </div> */}

        {/* <div className="unified-form-group">
          <label className="unified-form-label">Facebook URL</label>
          <input
            type="url"
            className="unified-form-input"
            placeholder="https://facebook.com/..."
            value={formData.facebookUrl || ''}
            onChange={(e) => handleChange('facebookUrl', e.target.value)}
          />
        </div> */}

        {/* {isOpportunity && (
          <>
            <div className="unified-form-group">
              <label className="unified-form-label">Discord Server</label>
              <input
                type="url"
                className="unified-form-input"
                placeholder="https://discord.gg/..."
                value={formData.discordUrl || ''}
                onChange={(e) => handleChange('discordUrl', e.target.value)}
              />
            </div>

            <div className="unified-form-group">
              <label className="unified-form-label">Slack Workspace</label>
              <input
                type="url"
                className="unified-form-input"
                placeholder="https://slack.com/..."
                value={formData.slackUrl || ''}
                onChange={(e) => handleChange('slackUrl', e.target.value)}
              />
            </div>

            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">Sponsors</label>
              <textarea
                className="unified-form-textarea"
                placeholder="List event sponsors (one per line)"
                value={formData.sponsors || ''}
                onChange={(e) => handleChange('sponsors', e.target.value)}
                rows={4}
              />
              <span className="unified-form-hint">Enter each sponsor on a new line</span>
            </div>

            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">Partners</label>
              <textarea
                className="unified-form-textarea"
                placeholder="List event partners (one per line)"
                value={formData.partners || ''}
                onChange={(e) => handleChange('partners', e.target.value)}
                rows={4}
              />
              <span className="unified-form-hint">Enter each partner on a new line</span>
            </div>
          </>
        )} */}

        {/* FAQs */}
        {/* <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <label className="unified-form-label">Frequently Asked Questions</label>
          <textarea
            className="unified-form-textarea"
            placeholder="Add FAQs in format: Q: Question? A: Answer (one per line)"
            value={formData.faqs || ''}
            onChange={(e) => handleChange('faqs', e.target.value)}
            rows={6}
          />
          <span className="unified-form-hint">Format: Q: Your question? A: Your answer</span>
        </div> */}

        {/* Terms and Conditions */}
        {/* <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Terms & Conditions</label>
          <textarea
            className="unified-form-textarea"
            placeholder="Enter terms and conditions"
            value={formData.termsAndConditions || ''}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            rows={6}
          />
        </div> */}

        {/* Additional Notes */}
        {/* <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Additional Notes</label>
          <textarea
            className="unified-form-textarea"
            placeholder="Any other information you'd like to add"
            value={formData.additionalNotes || ''}
            onChange={(e) => handleChange('additionalNotes', e.target.value)}
            rows={4}
          />
        </div> */}

        {/* Checkboxes */}
        <div className="unified-form-group unified-full-width">
          <div className="unified-checkbox-group">
            <input
              type="checkbox"
              id="featured"
              className="unified-checkbox-input"
              checked={formData.featured || false}
              onChange={(e) => handleChange('featured', e.target.checked)}
            />
            <label htmlFor="featured" className="unified-checkbox-label">
              Mark as Featured
            </label>
          </div>
        </div>
      </div>

      {/* Important Date Modal */}
      {showImportantDateModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowImportantDateModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>Add an Important Date</h3>
              <button className="rounds-modal-close" onClick={() => setShowImportantDateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rounds-modal-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                Add milestone dates related to your {isOpportunity ? 'opportunity' : 'job'} listing, such as submission deadlines, result announcements, or company sessions
              </p>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">
                  Date Title <span className="unified-required">*</span>
                </label>
                <input
                  type="text"
                  className="unified-form-input"
                  placeholder="e.g. Application Deadline, Interview Start, Offer Rollout"
                  value={dateForm.title}
                  onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
                />
              </div>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Date</label>
                <input
                  type="date"
                  className="unified-form-input"
                  placeholder="Select Date From The Date Picker"
                  value={dateForm.date}
                  onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleAddImportantDate}
                disabled={!dateForm.title || !dateForm.date}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="rounds-modal-header">
              <h3>Add new contact</h3>
              <button className="rounds-modal-close" onClick={() => setShowContactModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rounds-modal-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                Add details of the person (name, email, and phone) to help candidates with queries during the process.
              </p>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">
                  Name <span className="unified-required">*</span>
                </label>
                <input
                  type="text"
                  className="unified-form-input"
                  placeholder="Enter name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">
                  Email <span className="unified-required">*</span>
                </label>
                <input
                  type="email"
                  className="unified-form-input"
                  placeholder="Enter Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Mobile</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minWidth: '100px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                    <span style={{ color: '#fff' }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="unified-form-input"
                    placeholder="Enter mobile number"
                    value={contactForm.mobile}
                    onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleAddContact}
                disabled={!contactForm.name || (!contactForm.email && !contactForm.mobile)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInfoStep;


      {/* Important Date Modal */}
      // {showImportantDateModal && (
      //   <div className="rounds-modal-overlay" onClick={() => setShowImportantDateModal(false)}>
      //     <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      //       <div className="rounds-modal-header">
      //         <h3>Add an Important Date</h3>
      //         <button className="rounds-modal-close" onClick={() => setShowImportantDateModal(false)}>
      //           <X size={20} />
      //         </button>
      //       </div>
      //       <div className="rounds-modal-body">
      //         <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
      //           Add milestone dates related to your {isOpportunity ? 'opportunity' : 'job'} listing, such as submission deadlines, result announcements, or company sessions
      //         </p>
      //         <div className="unified-form-group unified-full-width">
      //           <label className="unified-form-label">
      //             Date Title <span className="unified-required">*</span>
      //           </label>
      //           <input
      //             type="text"
      //             className="unified-form-input"
      //             placeholder="e.g. Application Deadline, Interview Start, Offer Rollout"
      //             value={dateForm.title}
      //             onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
      //           />
      //         </div>
      //         <div className="unified-form-group unified-full-width">
      //           <label className="unified-form-label">Date</label>
      //           <input
      //             type="date"
      //             className="unified-form-input"
      //             placeholder="Select Date From The Date Picker"
      //             value={dateForm.date}
      //             onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
      //           />
      //         </div>
      //       </div>
      //       <div className="rounds-modal-footer">
      //         <button 
      //           className="btn-primary" 
      //           onClick={handleAddImportantDate}
      //           disabled={!dateForm.title || !dateForm.date}
      //         >
      //           Save
      //         </button>
      //       </div>
      //     </div>
      //   </div>
      // )}

      {/* Add Contact Modal */}
      // {showContactModal && (
      //   <div className="rounds-modal-overlay" onClick={() => setShowContactModal(false)}>
      //     <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      //       <div className="rounds-modal-header">
      //         <h3>Add new contact</h3>
      //         <button className="rounds-modal-close" onClick={() => setShowContactModal(false)}>
      //           <X size={20} />
      //         </button>
      //       </div>
      //       <div className="rounds-modal-body">
      //         <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
      //           Add details of the person (name, email, and phone) to help candidates with queries during the process.
      //         </p>
      //         <div className="unified-form-group unified-full-width">
      //           <label className="unified-form-label">
      //             Name <span className="unified-required">*</span>
      //           </label>
      //           <input
      //             type="text"
      //             className="unified-form-input"
      //             placeholder="Enter name"
      //             value={contactForm.name}
      //             onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
      //           />
      //         </div>
      //         <div className="unified-form-group unified-full-width">
      //           <label className="unified-form-label">
      //             Email <span className="unified-required">*</span>
      //           </label>
      //           <input
      //             type="email"
      //             className="unified-form-input"
      //             placeholder="Enter Email"
      //             value={contactForm.email}
      //             onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
      //           />
      //         </div>
      //         <div className="unified-form-group unified-full-width">
      //           <label className="unified-form-label">Mobile</label>
      //           <div style={{ display: 'flex', gap: '0.5rem' }}>
      //             <div style={{
      //               padding: '0.75rem',
      //               background: 'rgba(255, 255, 255, 0.05)',
      //               border: '1px solid rgba(255, 255, 255, 0.1)',
      //               borderRadius: '8px',
      //               display: 'flex',
      //               alignItems: 'center',
      //               gap: '0.5rem',
      //               minWidth: '100px'
      //             }}>
      //               <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
      //               <span style={{ color: '#fff' }}>+91</span>
      //             </div>
      //             <input
      //               type="tel"
      //               className="unified-form-input"
      //               placeholder="Enter mobile number"
      //               value={contactForm.mobile}
      //               onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
      //               style={{ flex: 1 }}
      //             />
      //           </div>
      //         </div>
      //       </div>
      //       <div className="rounds-modal-footer">
      //         <button 
      //           className="btn-primary" 
      //           onClick={handleAddContact}
      //           disabled={!contactForm.name || (!contactForm.email && !contactForm.mobile)}
      //         >
      //           Save
      //         </button>
      //       </div>
      //     </div>
      //   </div>
      // )}
