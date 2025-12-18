import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePreloader } from '../hooks/usePreloader';
import BannedUserScreen from '../components/BannedUserScreen';
import { redirectToDashboard } from '../utils/roleRedirect';
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
  const [showPassword, setShowPassword] = useState(false);
  const [bannedUserInfo, setBannedUserInfo] = useState(null);
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

  const handleGoogleLogin = () => {
    // Redirect to backend Google auth endpoint
    // Standard OAuth flow usually starts with a redirect to backend which then redirects to Google
    window.location.href = 'http://localhost:4000/api/auth/google';
  };

  const handleLinkedInLogin = () => {
    // Redirect to backend LinkedIn auth endpoint
    window.location.href = 'http://localhost:4000/api/auth/linkedin';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        // Check if there's a redirect URL stored (from Quick Apply or other pages)
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

        if (redirectUrl) {
          // Clear the stored redirect URL
          sessionStorage.removeItem('redirectAfterLogin');
          // Redirect to the stored page
          window.location.href = redirectUrl;
        } else {
          // Normal login - redirect based on user role
          redirectToDashboard(result.user?.role);
        }
        return;
      } else {
        // Check if user is banned
        if (result.isBanned) {
          setBannedUserInfo({
            supportEmail: result.supportEmail,
            supportPhone: result.supportPhone
          });
          return;
        }

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

          // Don't set error state, just redirect with email as query parameter
          setTimeout(() => {
            navigate(`/resend-verification?email=${encodeURIComponent(formData.email)}`);
          }, 1500);
        } else {
          toast.error(result.error || 'Login failed', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } catch (err) {
      toast.error('Login failed. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show banned user screen if user is banned
  if (bannedUserInfo) {
    return (
      <BannedUserScreen
        supportEmail={bannedUserInfo.supportEmail}
        supportPhone={bannedUserInfo.supportPhone}
        onBackToLogin={() => setBannedUserInfo(null)}
      />
    );
  }

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
            <h2>Hello Again</h2>
            <p className="auth-subtitle">Welcome back, you've been missed</p>
          </div>

          <div className="social-login-container">
            <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
              <i className="fab fa-google"></i>
            </button>
            <button type="button" className="social-btn linkedin" onClick={handleLinkedInLogin}>
              <i className="fab fa-linkedin-in"></i>
            </button>
          </div>

          <div className="auth-divider">
            <span>Or</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
              <Link
                to={formData.email ? `/forgot-password?email=${encodeURIComponent(formData.email)}` : "/forgot-password"}
                className="forgot-link"
              >
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