import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      
      <div className="auth-content">
        <div className="auth-card register-selection">
          <div className="auth-header">
            <h2>Choose Your Registration Type</h2>
            <Link to="/" className="close-btn">×</Link>
          </div>

          <div className="registration-options">
            <Link to="/signup?type=candidate" className="registration-option">
              <div className="option-icon">
                <i className="fa-solid fa-user"></i>
              </div>
              <h3>Register as Candidate</h3>
              <p>Looking for jobs, internships, and career opportunities</p>
              <div className="option-arrow">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>

            <Link to="/signup?type=recruiter" className="registration-option">
              <div className="option-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <h3>Register as Recruiter</h3>
              <p>Post jobs, find talent, and manage recruitment</p>
              <div className="option-arrow">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          </div>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;