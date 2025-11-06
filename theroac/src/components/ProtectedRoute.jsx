import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user?.role)) {
      // Redirect to appropriate dashboard based on user role
      let redirectPath = '/candidate-dashboard';
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        redirectPath = '/admin-dashboard';
      } else if (user?.role === 'recruiter') {
        redirectPath = '/recruiter-dashboard';
      } else if (user?.role === 'candidate') {
        redirectPath = '/candidate-dashboard';
      }
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;