import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Get user profile details
 * @param {string} id - User ID
 */
export const getProfile = async (id) => {
  const response = await axios.get(getApiUrl(`/api/users/${id}`));
  return response.data;
};

/**
 * Update user profile details
 * @param {string} id - User ID
 * @param {Object} profileData - Profile details to update
 */
export const updateProfile = async (id, profileData) => {
  const response = await axios.put(getApiUrl(`/api/users/${id}`), profileData);
  return response.data;
};

/**
 * Add or update a teaching skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, experienceLevel, proofLink }
 */
export const addTeachSkill = async (id, skillData) => {
  const response = await axios.post(getApiUrl(`/api/users/${id}/skills-teach`), skillData);
  return response.data;
};

/**
 * Add or update a learning skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, desiredLevel }
 */
export const addLearnSkill = async (id, skillData) => {
  const response = await axios.post(getApiUrl(`/api/users/${id}/skills-learn`), skillData);
  return response.data;
};

/**
 * Fetch badges earned by a user
 * @param {string} id - User ID
 */
export const getBadges = async (id) => {
  const response = await axios.get(getApiUrl(`/api/users/${id}/badges`));
  return response.data;
};
