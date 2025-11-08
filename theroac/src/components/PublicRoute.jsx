import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute - Prevents authenticated users from accessing auth pages
 * Redirects logged-in users to their appropriate dashboard
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

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
    let redirectPath = '/candidate-dashboard';
    
    if (user.role === 'admin' || user.role === 'superadmin') {
      redirectPath = '/admin-dashboard';
    } else if (user.role === 'recruiter') {
      redirectPath = '/recruiter-dashboard';
    } else if (user.role === 'candidate') {
      redirectPath = '/candidate-dashboard';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // User is not authenticated, allow access to public auth pages
  return children;
};

export default PublicRoute;
