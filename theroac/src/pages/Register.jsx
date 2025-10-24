import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img
            src="assets/img/login/Login-pana.svg"
            alt="Register Illustration"
          />
        </div>
        <div className="col-6">
          <div className="auth-header">
            <h2>Choose Your Registration Type</h2>
          </div>

          <div className="registration-options">
            <Link to="/signup?type=candidate" className="registration-option">
              <div className="option-left">
                <div className="option-icon">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="option-text">
                  <h3>
                    Register as <span>Candidate</span>
                  </h3>
                </div>
              </div>

              <div className="option-right">
                <i className="fa-solid fa-arrow-right option-arrow"></i>
              </div>
            </Link>

            <Link to="/signup?type=recruiter" className="registration-option">
              <div className="option-left">
                <div className="option-icon">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div className="option-text">
                  <h3>
                    Register as <span>Recruiter</span>
                  </h3>
                </div>
              </div>

              <div className="option-right">
                <i className="fa-solid fa-arrow-right option-arrow"></i>
              </div>
            </Link>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
