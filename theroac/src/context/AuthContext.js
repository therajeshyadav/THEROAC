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
        console.warn('⚠️ Auth loading timeout - forcing completion');
        setLoading(false);
        
        // Try to use stored data as last resort
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            console.log('🔄 Using stored credentials after timeout');
          } catch (error) {
            console.error('Failed to parse stored user after timeout:', error);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    }, 5000);

    return () => clearTimeout(fallbackTimeout);
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 Starting auth check...');
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔑 Token found:', !!token);
      console.log('👤 Stored user found:', !!storedUser);
      
      if (token && storedUser) {
        try {
          // First try to use stored user data immediately
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('💾 Using stored user data:', userData);
          
          // Then try to validate with server in background (optional)
          try {
            console.log('📡 Validating with server...');
            const serverUserData = await apiService.getCurrentUser();
            console.log('✅ Server validation successful:', serverUserData);
            // Update with fresh server data if different
            if (JSON.stringify(userData) !== JSON.stringify(serverUserData)) {
              setUser(serverUserData);
              localStorage.setItem('user', JSON.stringify(serverUserData));
            }
          } catch (apiError) {
            console.warn('⚠️ Server validation failed, continuing with stored data:', apiError.message);
            // Continue with stored data - don't fail the auth
          }
        } catch (parseError) {
          console.error('❌ Failed to parse stored user data:', parseError);
          // Clear invalid stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token or user found, ensure user is logged out
        console.log('🚫 No credentials found, logging out');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Clear everything on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('✅ Auth check complete, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
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
    console.log('🚪 Logging out user...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Also remove any other auth tokens
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Logout complete - user state cleared');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
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