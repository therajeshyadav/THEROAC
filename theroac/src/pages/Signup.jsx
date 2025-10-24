import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const userType = searchParams.get('type') || 'candidate';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: userType,
        ...(userType === 'candidate' && {
          university: formData.university,
          course: formData.course,
          graduationYear: formData.graduationYear,
        }),
        ...(userType === 'recruiter' && {
          company: formData.companyName,
          designation: formData.designation,
          companySize: formData.companySize,
          industry: formData.industry,
          website: formData.website,
        }),
      };

      const result = await register(userData);

      if (result.success) {
        if (userType === 'recruiter') {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/candidate-dashboard');
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container row justify-content-between auth-card">
        {/* Left Image Side */}
        <div className="col-5 align-content-center">
          <img
            src={
              userType === 'recruiter'
                ? 'assets/img/login/Business.svg'
                : 'assets/img/login/Login-pana.svg'
            }
            alt="Signup Illustration"
          />
        </div>

        {/* Right Form Side */}
        <div className="col-6">
          <div className="auth-header d-flex justify-content-start">
            <Link className='align-content-center' to="/register">
                <i className="fa-solid fa-arrow-left option-arrow"></i>
            </Link>
            <h2 style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
              {userType === 'recruiter' ? 'Join as Recruiter' : 'Register as Candidate'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form signup-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder={
                  userType === 'candidate'
                    ? 'Email Address'
                    : 'Organisation Email Address'
                }
                value={formData.email}
                onChange={handleChange}
                required
              />
              <i className="fa-solid fa-envelope input-icon"></i>
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <i className="fa-solid fa-phone input-icon"></i>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock input-icon"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock input-icon"></i>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : userType === 'recruiter' ? (
                'Join as Recruiter'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

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

export default Signup;
