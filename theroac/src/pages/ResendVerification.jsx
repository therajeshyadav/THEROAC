import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import './Auth.css';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.resendVerification({ email });
      setIsSubmitted(true);
      setMessage(response.message || 'Verification email sent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="container row justify-content-between auth-card">
          <div className="col-5 align-content-center">
            <img src="assets/img/login/Login-pana.svg" alt="Email Sent" />
          </div>
          <div className="col-6">
            <div className="auth-header">
              <h2>Verification Email Sent</h2>
            </div>

            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>{message}</p>
              <p className="text-muted">
                Please check your email and click the verification link to activate your account.
              </p>
            </div>

            <div className="auth-footer">
              <p>
                <Link to="/login">Back to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img src="assets/img/login/Login-pana.svg" alt="Resend Verification" />
        </div>
        <div className="col-6">
          <div className="auth-header">
            <Link to="/login" className="back-btn">
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h2>Resend Verification</h2>
            <p className="auth-subtitle">
              Enter your email address and we'll send you a new verification link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group has-icon">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <i className="fa-solid fa-envelope input-icon"></i>
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