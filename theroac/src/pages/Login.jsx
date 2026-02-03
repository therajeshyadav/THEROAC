import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePreloader } from '../hooks/usePreloader';
import BannedUserScreen from '../components/BannedUserScreen';
import { redirectToDashboard } from '../utils/roleRedirect';
import './Auth.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bannedUserInfo, setBannedUserInfo] = useState(null);
  const preloaderVisible = usePreloader(300);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      toast.success('Logged in successfully');

      // Prevent token staying in URL
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  /* ----------------------------------
     INPUT HANDLING
  ---------------------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}auth/google`;
  };

  const handleLinkedInLogin = () => {
    window.location.href = `${API_BASE_URL}auth/linkedin`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result?.success) {
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

        if (redirectUrl && redirectUrl.startsWith('/')) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          redirectToDashboard(result.user?.role);
        }
        return;
      }

      if (result?.isBanned) {
        setBannedUserInfo({
          supportEmail: result.supportEmail,
          supportPhone: result.supportPhone,
        });
        return;
      }

      const errorMsg = result?.error?.toLowerCase() || '';
      const needsVerification =
        result?.needsVerification ||
        errorMsg.includes('verify');

      if (needsVerification) {
        toast.warning('Please verify your email first.');
        navigate(`/resend-verification?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(result?.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ----------------------------------
     BANNED USER VIEW
  ---------------------------------- */
  if (bannedUserInfo) {
    return (
      <BannedUserScreen
        supportEmail={bannedUserInfo.supportEmail}
        supportPhone={bannedUserInfo.supportPhone}
        onBackToLogin={() => setBannedUserInfo(null)}
      />
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div className="auth-container">
      {preloaderVisible && (
        <div className="preloader">
          <div className="loading-container">
            <div className="loading" />
            <div id="loading-icon">
              <img src="/assets/img/logo/preloader.png" alt="Loading" />
            </div>
          </div>
        </div>
      )}

      <div className="container row justify-content-between auth-card">
        <div className="col-5 align-content-center">
          <img src="/assets/img/login/Login-pana.svg" alt="Login Illustration" />
        </div>

        <div className="col-6">
          <div className="auth-header">
            <h2>Hello Again</h2>
            <p className="auth-subtitle">Welcome back, you've been missed</p>
          </div>

          <div className="social-login-container">
            <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
              <i className="fab fa-google" />
            </button>

            <button type="button" className="social-btn linkedin" onClick={handleLinkedInLogin}>
              <i className="fab fa-linkedin-in" />
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
              <i className="fa-solid fa-envelope input-icon" />
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={submitLoading}
              />
              <i className="fa-solid fa-lock input-icon" />

              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={submitLoading}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
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
                <span className="checkmark" />
                Remember me
              </label>

              <Link
                to={formData.email ? `/forgot-password?email=${encodeURIComponent(formData.email)}` : '/forgot-password'}
                className="forgot-link"
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-btn" disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
