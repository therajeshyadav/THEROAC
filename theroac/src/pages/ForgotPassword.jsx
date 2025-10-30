import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
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
      await apiService.forgotPassword({ email });
      setIsSubmitted(true);
      setMessage('Password reset instructions have been sent to your email address.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
            <img src="assets/img/login/Login-pana.svg" alt="Check Email" />
          </div>
          <div className="col-6">
            <div className="auth-header">
              <h2>Check Your Email</h2>
            </div>

            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>{message}</p>
              <p className="text-muted">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
            </div>

            <div className="auth-footer">
              <p>
                Remember your password? <Link to="/login">Back to Login</Link>
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
          <img src="assets/img/login/Login-pana.svg" alt="Forgot Password" />
        </div>
        <div className="col-6">
          <div className="auth-header">
           
            <h2>Forgot Password</h2>

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
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;