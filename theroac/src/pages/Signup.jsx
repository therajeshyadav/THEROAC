import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number input - only allow 10 digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: digitsOnly,
        }));
      }
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate phone number - must be exactly 10 digits
    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      toast.error('Phone number must be exactly 10 digits', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: `+91${formData.phone}`,
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
        if (result.needsVerification) {
          // Show success toast notification
          toast.success(
            `Registration successful! Please check your email (${formData.email}) to verify your account.`,
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          
          // Show info toast about resending
          setTimeout(() => {
            toast.info(
              "Didn't receive the email? You can resend it from the login page or resend verification page.",
              {
                position: "top-center",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }, 1000);
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2500);
        } else {
          // For users who don't need verification (shouldn't happen now)
          toast.success('Registration successful!');
          if (userType === 'recruiter') {
            navigate('/recruiter-dashboard');
          } else {
            navigate('/candidate-dashboard');
          }
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

            <div className="form-group has-icon">
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

            <div className="form-group has-icon phone-input-group">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                name="phone"
                placeholder="Enter 10 digit number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                required
              />
              <i className="fa-solid fa-phone input-icon"></i>
            </div>

            <div className="form-row">
              <div className="form-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock input-icon"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <div className="form-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock input-icon"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
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
            <p style={{ marginTop: '10px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Didn't receive verification email? <Link to="/resend-verification" style={{ color: '#FFD600' }}>Resend</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
