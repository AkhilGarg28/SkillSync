import api from './api';

/**
 * Fetch profile data for a user
 * @param {string} id - User ID
 */
export const getProfile = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

/**
 * Update profile details (basic details, timezone, availability slots)
 * @param {string} id - User ID
 * @param {Object} profileData - Fields to update
 */
export const updateProfile = async (id, profileData) => {
  const response = await api.put(`/api/users/${id}`, profileData);
  return response.data;
};

/**
 * Add or update a teaching skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, experienceLevel, proofLink }
 */
export const addTeachSkill = async (id, skillData) => {
  const response = await api.post(`/api/users/${id}/skills-teach`, skillData);
  return response.data;
};

/**
 * Add or update a learning skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, desiredLevel }
 */
export const addLearnSkill = async (id, skillData) => {
  const response = await api.post(`/api/users/${id}/skills-learn`, skillData);
  return response.data;
};

/**
 * Retrieve badges earned by user
 * @param {string} id - User ID
 */
export const getBadges = async (id) => {
  const response = await api.get(`/api/users/${id}/badges`);
  return response.data;
};
