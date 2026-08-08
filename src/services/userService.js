import axios from 'axios';

const API_URL = '/api/users';

/**
 * Get user profile details
 * @param {string} id - User ID
 */
export const getProfile = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Update user profile details
 * @param {string} id - User ID
 * @param {Object} profileData - Profile details to update
 */
export const updateProfile = async (id, profileData) => {
  const response = await axios.put(`${API_URL}/${id}`, profileData);
  return response.data;
};

/**
 * Add or update a teaching skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, experienceLevel, proofLink }
 */
export const addTeachSkill = async (id, skillData) => {
  const response = await axios.post(`${API_URL}/${id}/skills-teach`, skillData);
  return response.data;
};

/**
 * Add or update a learning skill
 * @param {string} id - User ID
 * @param {Object} skillData - { skillName, desiredLevel }
 */
export const addLearnSkill = async (id, skillData) => {
  const response = await axios.post(`${API_URL}/${id}/skills-learn`, skillData);
  return response.data;
};

/**
 * Fetch badges earned by a user
 * @param {string} id - User ID
 */
export const getBadges = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/badges`);
  return response.data;
};
