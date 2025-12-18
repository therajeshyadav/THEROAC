/**
 * Utility function to get the appropriate dashboard URL based on user role
 * @param {string} role - User role (admin, recruiter, candidate)
 * @returns {string} - Dashboard URL path
 */
export const getDashboardPath = (role) => {
  const userRole = role?.toLowerCase();
  
  switch (userRole) {
    case 'admin':
    case 'superadmin':
      return '/admin-dashboard';
    case 'recruiter':
      return '/recruiter-dashboard';
    case 'candidate':
      return '/candidate-dashboard';
    default:
      // Fallback to candidate dashboard for unknown roles
      return '/candidate-dashboard';
  }
};

/**
 * Redirect user to appropriate dashboard based on their role
 * @param {string} role - User role
 * @param {boolean} replace - Whether to replace current history entry (default: false)
 */
export const redirectToDashboard = (role, replace = false) => {
  const dashboardPath = getDashboardPath(role);
  
  if (replace) {
    window.location.replace(dashboardPath);
  } else {
    window.location.href = dashboardPath;
  }
};