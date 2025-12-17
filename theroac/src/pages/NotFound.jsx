import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [countdown, setCountdown] = useState(10);
    const [autoRedirect, setAutoRedirect] = useState(true);

    const handleGoHome = () => {
        setAutoRedirect(false);
        if (isAuthenticated) {
            navigate(getDashboardUrl(user));
        } else {
            navigate('/');
        }
    };

    const handleGoBack = () => {
        setAutoRedirect(false);
        navigate(-1);
    };

    const handleStopRedirect = () => {
        setAutoRedirect(false);
    };

    const getDashboardUrl = (user) => {
        if (!user) return '/candidate-dashboard';
        
        switch (user.role) {
            case 'admin':
            case 'superadmin':
                return '/admin-dashboard';
            case 'recruiter':
                return '/recruiter-dashboard';
            case 'candidate':
            default:
                return '/candidate-dashboard';
        }
    };

    // Auto-redirect countdown (optional)
    useEffect(() => {
        if (!autoRedirect) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (isAuthenticated) {
                        navigate(getDashboardUrl(user));
                    } else {
                        navigate('/');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, autoRedirect]);

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-animation">
                    <div className="error-code">404</div>
                    <div className="error-message">Page Not Found</div>
                </div>
                
                <div className="not-found-details">
                    <h2>
                        {isAuthenticated 
                            ? `Hey ${user?.name || user?.fullName || 'there'}! Page not found` 
                            : 'Oops! Something went wrong'
                        }
                    </h2>
                    {isAuthenticated && user?.role && (
                        <p className="user-role-text">
                            Welcome back, {user.role.charAt(0).toUpperCase() + user.role.slice(1)}!
                        </p>
                    )}
                    <p>The page you're looking for doesn't exist or has been moved.</p>
                    <p>Don't worry, let's get you back on track!</p>
                    {autoRedirect && (
                        <p className="countdown-text">
                            Redirecting to {isAuthenticated ? 'dashboard' : 'homepage'} in <span className="countdown">{countdown}</span> seconds...
                            <button className="stop-redirect-btn" onClick={handleStopRedirect}>
                                Cancel
                            </button>
                        </p>
                    )}
                </div>

                <div className="not-found-actions">
                    <button className="btn-primary" onClick={handleGoHome}>
                        <i className={isAuthenticated ? "fas fa-tachometer-alt" : "fas fa-home"}></i>
                        {isAuthenticated ? 'Go to Dashboard' : 'Go to Homepage'}
                    </button>
                    <button className="btn-secondary" onClick={handleGoBack}>
                        <i className="fas fa-arrow-left"></i>
                        Go Back
                    </button>
                </div>

                <div className="not-found-suggestions">
                    <h3>You might be looking for:</h3>
                    <div className="suggestion-links">
                        <a href="/" className="suggestion-link">
                            <i className="fas fa-home"></i>
                            <span>Home</span>
                        </a>
                        
                        {isAuthenticated ? (
                            // Show dashboard links for authenticated users
                            <>
                                <a href={getDashboardUrl(user)} className="suggestion-link">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>My Dashboard</span>
                                </a>
                                <a href="/speakers" className="suggestion-link">
                                    <i className="fas fa-calendar"></i>
                                    <span>Events</span>
                                </a>
                                <a href="/schedule" className="suggestion-link">
                                    <i className="fas fa-briefcase"></i>
                                    <span>Opportunities</span>
                                </a>
                                <a href="/blog" className="suggestion-link">
                                    <i className="fas fa-blog"></i>
                                    <span>Blog</span>
                                </a>
                            </>
                        ) : (
                            // Show auth links for non-authenticated users
                            <>
                                <a href="/login" className="suggestion-link">
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span>Login</span>
                                </a>
                                <a href="/register" className="suggestion-link">
                                    <i className="fas fa-user-plus"></i>
                                    <span>Register</span>
                                </a>
                            </>
                        )}
                        
                        <a href="/contact" className="suggestion-link">
                            <i className="fas fa-envelope"></i>
                            <span>Contact Us</span>
                        </a>
                    </div>
                </div>

                <div className="not-found-footer">
                    <div className="logo-section">
                        <img src="/assets/img/logo/logo5.png" alt="ROAC Logo" className="logo" />
                        <span>ROAC - Rise of AI Conference</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;