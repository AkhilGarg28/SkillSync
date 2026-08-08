import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as authService from '../services/authService';

// Initialize Axios Request Interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('skillsync_user');
        const storedToken = localStorage.getItem('skillsync_token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('skillsync_user');
        localStorage.removeItem('skillsync_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('skillsync_token', token);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      setUser(userData);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('skillsync_token', token);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      setUser(userData);
      return response;
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
