import React, { useState } from 'react';
import { Shield, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import './BannedUserScreen.css';

const BannedUserScreen = ({ supportEmail, supportPhone, onBackToLogin }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/admin/banned-user-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Your message has been sent to the admin team. We will review your case and get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
        setShowContactForm(false);
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending banned user contact:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="banned-user-container">
      <div className="banned-user-background"></div>
      
      <div className="banned-user-content">
        <div className="banned-user-card">
          <div className="banned-user-header">
            <div className="banned-icon">
              <Shield className="w-12 h-12" />
            </div>
            <h1>Account Suspended</h1>
            <p className="banned-message">
              Your account has been temporarily suspended due to a violation of our terms of service.
            </p>
          </div>

          <div className="banned-user-body">
            <div className="banned-info-section">
              <h3>What does this mean?</h3>
              <ul className="banned-info-list">
                <li>You cannot access your account or platform features</li>
                <li>Your profile and applications are temporarily hidden</li>
                <li>You cannot apply for jobs or register for events</li>
                <li>This suspension may be temporary or permanent</li>
              </ul>
            </div>

            <div className="banned-contact-section">
              <h3>Need Help?</h3>
              <p>If you believe this is a mistake or would like to appeal this decision, please contact our admin team:</p>
              
              <div className="contact-options">
                <div className="contact-option">
                  <Mail className="w-5 h-5" />
                  <div>
                    <span className="contact-label">Email Support</span>
                    <a href={`mailto:${supportEmail}`} className="contact-value">
                      {supportEmail}
                    </a>
                  </div>
                </div>
                
                <div className="contact-option">
                  <Phone className="w-5 h-5" />
                  <div>
                    <span className="contact-label">Phone Support</span>
                    <a href={`tel:${supportPhone}`} className="contact-value">
                      {supportPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-form-section">
                {!showContactForm ? (
                  <button 
                    className="contact-admin-btn"
                    onClick={() => setShowContactForm(true)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message to Admin
                  </button>
                ) : (
                  <form onSubmit={handleSubmitContact} className="contact-form">
                    <h4>Contact Admin Team</h4>
                    <div className="form-group">
                      <label htmlFor="name">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={contactForm.message}
                        onChange={handleInputChange}
                        placeholder="Explain your situation or appeal..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => setShowContactForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="banned-user-footer">
            <button 
              className="back-to-login-btn"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedUserScreen;