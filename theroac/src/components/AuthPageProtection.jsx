import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPageProtection = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="preloader">
                <div className="loading-container">
                    <div className="loading"></div>
                    <div id="loading-icon">
                        <img src="assets/img/logo/preloader.png" alt="" />
                    </div>
                </div>
            </div>
        );
    }

    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        } else if (user.role === 'recruiter') {
            return <Navigate to="/recruiter-dashboard" replace />;
        } else {
            return <Navigate to="/candidate-dashboard" replace />;
        }
    }

    // If not authenticated, show the auth page
    return children;
};

export default AuthPageProtection;