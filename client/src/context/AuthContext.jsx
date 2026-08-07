import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto Login on initialization
  useEffect(() => {
    const autoLogin = async () => {
      const storedToken = localStorage.getItem('skillsync_token');
      const storedUser = localStorage.getItem('skillsync_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify & fetch fresh profile data silently
          const res = await userService.getProfile(parsedUser.id);
          setUser(res.data);
          localStorage.setItem('skillsync_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session validation failed. Logging out.', err);
          logout();
        }
      }
      setLoading(false);
    };

    autoLogin();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user: userData } = res.data;
      localStorage.setItem('skillsync_token', token);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      setUser(userData);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      const { token, user: userData } = res.data;
      localStorage.setItem('skillsync_token', token);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      setUser(userData);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_user');
    setUser(null);
  };

  const updateUserInState = (updatedUserData) => {
    localStorage.setItem('skillsync_user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser: updateUserInState,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
