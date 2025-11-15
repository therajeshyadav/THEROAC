import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import './Auth.css';

const ResendVerification = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromUrl);
  const [loading, setLoading] = useState(false);
  const isEmailPrefilled = !!emailFromUrl;

  useEffect(() => {
    // Update email if URL parameter changes
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.resendVerification({ email });
      
      // Show success toast
      toast.success(
        `Verification email sent successfully to ${email}! Please check your inbox.`,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      // Clear the email field if not prefilled
      if (!isEmailPrefilled) {
        setEmail('');
      }
    } catch (err) {
      // Only show toast notification, no error box
      toast.error(err.message || 'Failed to send verification email. Please try again.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="auth-container">
      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img src="assets/img/login/Login-pana.svg" alt="Resend Verification" />
        </div>
        <div className="col-6">
          <div className="auth-header">
            <h2>Resend Verification</h2>
            <p className="auth-subtitle">
              {isEmailPrefilled 
                ? "We'll send a new verification link to your email address."
                : "Enter your email address and we'll send you a new verification link."
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group has-icon">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                required
                disabled={loading}
                readOnly={isEmailPrefilled}
                style={isEmailPrefilled ? { 
                  cursor: 'not-allowed', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                } : {}}
              />
              <i className="fa-solid fa-envelope input-icon"></i>
              {isEmailPrefilled && (
                <i 
                  className="fa-solid fa-lock" 
                  style={{ 
                    position: 'absolute', 
                    right: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'rgba(255, 214, 0, 0.7)',
                    fontSize: '14px'
                  }}
                  title="Email is locked from login attempt"
                ></i>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading || !email}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                'Send Verification Email'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;