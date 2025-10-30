import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import './Auth.css';

const VerificationPending = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const email = location.state?.email || '';
  const initialMessage = location.state?.message || 'Please check your email to verify your account.';

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address not found. Please try registering again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.resendVerification({ email });
      setMessage(response.message || 'Verification email sent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img src="assets/img/login/Login-pana.svg" alt="Email Verification Pending" />
        </div>
        <div className="col-6">
          <div className="auth-header">
            <h2>Check Your Email</h2>
            <p className="auth-subtitle">
              We've sent a verification link to your email address.
            </p>
          </div>

          <div className="verification-info">
            <div className="info-message">
              <i className="fas fa-envelope"></i>
              <p>{initialMessage}</p>
              {email && (
                <p className="email-display">
                  Verification email sent to: <strong>{email}</strong>
                </p>
              )}
            </div>

            {message && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error}</p>
              </div>
            )}

            <div className="verification-steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Check your email inbox for a verification message</li>
                <li>Click the verification link in the email</li>
                <li>Return here to log in to your account</li>
              </ol>
              <p className="help-text">
                <strong>Can't find the email?</strong> Check your spam or junk folder.
              </p>
            </div>

            <div className="verification-actions">
              <button 
                onClick={handleResendVerification}
                className="auth-btn secondary-btn"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Already verified? <Link to="/login">Login to your account</Link>
            </p>
            <p>
              Need help? <Link to="/contact">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;