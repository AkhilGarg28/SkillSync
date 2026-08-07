import api from './api';

/**
 * Local user registration
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

/**
 * Local user email/password login
 * @param {string} email 
 * @param {string} password 
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Request password recovery email
 * @param {string} email 
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

/**
 * Submit new password
 * @param {string} token 
 * @param {string} newPassword 
 */
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/api/auth/reset-password', { token, newPassword });
  return response.data;
};

/**
 * Redirect browser to backend Google authentication consent page
 */
export const initiateGoogleLogin = () => {
  window.location.href = '/api/auth/google';
};
