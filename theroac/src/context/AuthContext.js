import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Fallback: Force loading to false after 5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        
        // Try to use stored data as last resort
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    }, 5000);

    return () => clearTimeout(fallbackTimeout);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // First try to use stored user data immediately
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Then try to validate with server in background (optional)
          try {
            const serverUserData = await apiService.getCurrentUser();
            // Update with fresh server data if different
            if (JSON.stringify(userData) !== JSON.stringify(serverUserData)) {
              setUser(serverUserData);
              localStorage.setItem('user', JSON.stringify(serverUserData));
            }
          } catch (apiError) {
            // Continue with stored data - don't fail the auth
          }
        } catch (parseError) {
          // Clear invalid stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token or user found, ensure user is logged out
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Clear everything on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      // Check if user needs verification
      if (response.needsVerification) {
        return { 
          success: false, 
          error: response.message,
          needsVerification: true 
        };
      }

      // Check if user is banned
      if (response.isBanned) {
        return {
          success: false,
          error: response.message,
          isBanned: true,
          supportEmail: response.supportEmail,
          supportPhone: response.supportPhone
        };
      }
      
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      // Check if the error response contains ban information
      if (error.response?.data?.isBanned) {
        return {
          success: false,
          error: error.response.data.message,
          isBanned: true,
          supportEmail: error.response.data.supportEmail,
          supportPhone: error.response.data.supportPhone
        };
      }
      
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      
      // Check if user needs verification
      if (response.needsVerification) {
        // Don't set authentication state for unverified users
        return { 
          success: true, 
          user: response.user, 
          needsVerification: true,
          message: response.message 
        };
      }
      
      // For verified users (shouldn't happen with current flow)
      const { token, user: newUser } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Also remove any other auth tokens
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setAuthFromToken = (token, userData) => {
    if (!token || !userData) return;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    setAuthFromToken,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};