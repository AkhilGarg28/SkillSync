import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
export const register = async (name, email, password) => {
  const response = await axios.post(getApiUrl('/api/auth/register'), { name, email, password });
  return response.data;
};

/**
 * Login a user using email and password
 * @param {string} email 
 * @param {string} password 
 */
export const login = async (email, password) => {
  const response = await axios.post(getApiUrl('/api/auth/login'), { email, password });
  return response.data;
};

/**
 * Send password reset email link
 * @param {string} email 
 */
export const forgotPassword = async (email) => {
  const response = await axios.post(getApiUrl('/api/auth/forgot-password'), { email });
  return response.data;
};

/**
 * Reset password using reset token
 * @param {string} token 
 * @param {string} newPassword 
 */
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(getApiUrl('/api/auth/reset-password'), { token, newPassword });
  return response.data;
};

/**
 * Redirect browser to Google OAuth initiation endpoint
 */
export const initiateGoogleLogin = () => {
  window.location.href = getApiUrl('/api/auth/google');
};
