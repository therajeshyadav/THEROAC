import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePreloader } from '../hooks/usePreloader';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const preloaderVisible = usePreloader(300);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (result.user.role === 'recruiter') {
          navigate('/recruiter-dashboard', { replace: true });
        } else {
          navigate('/candidate-dashboard', { replace: true });
        }
      } else {
        // Check if error message contains verification-related keywords
        const errorMsg = result.error || '';
        const isVerificationError = 
          result.needsVerification || 
          errorMsg.toLowerCase().includes('verify') || 
          errorMsg.toLowerCase().includes('verification') ||
          errorMsg.toLowerCase().includes('not verified');
        
        if (isVerificationError) {
          // Show warning toast for unverified email
          toast.warning(
            'Please verify your email before logging in. Redirecting to resend verification...',
            {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          
          // Don't set error state, just redirect
          setTimeout(() => {
            navigate('/resend-verification');
          }, 1500);
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {preloaderVisible && (
        <div className="preloader">
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon">
              <img src="assets/img/logo/preloader.png" alt="" />
            </div>
          </div>
        </div>
      )}
      <div className="paginacontainer">
        <div className="progress-wrap warp2">
          <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div>  
      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img src="assets/img/login/Login-pana.svg" alt="" />
        </div>
        <div className="col-6">
          <div className="auth-header">
            <h2>Login</h2>
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
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitLoading}
              />
              <i className="fa-solid fa-envelope input-icon"></i>
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={submitLoading}
              />
              <i className="fa-solid fa-lock input-icon"></i>
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={submitLoading}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-btn" disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;