import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BannedUserScreen from './BannedUserScreen';

const GlobalBanHandler = ({ children }) => {
  const [bannedInfo, setBannedInfo] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleUserBanned = (event) => {
      const { supportEmail, supportPhone } = event.detail;
      
      // Force logout the user
      logout();
      
      // Show banned screen
      setBannedInfo({
        supportEmail,
        supportPhone
      });
    };

    // Listen for ban events
    window.addEventListener('userBanned', handleUserBanned);

    // Periodic status check (every 5 minutes)
    const statusCheckInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.status === 403) {
            const data = await response.json();
            if (data.isBanned) {
              handleUserBanned({
                detail: {
                  supportEmail: data.supportEmail,
                  supportPhone: data.supportPhone
                }
              });
            }
          }
        } catch (error) {
          // Ignore errors in background check
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      window.removeEventListener('userBanned', handleUserBanned);
      clearInterval(statusCheckInterval);
    };
  }, [logout]);

  // If user is banned, show banned screen
  if (bannedInfo) {
    return (
      <BannedUserScreen
        supportEmail={bannedInfo.supportEmail}
        supportPhone={bannedInfo.supportPhone}
        onBackToLogin={() => {
          setBannedInfo(null);
          window.location.href = '/login';
        }}
      />
    );
  }

  // Otherwise, render children normally
  return children;
};

export default GlobalBanHandler;