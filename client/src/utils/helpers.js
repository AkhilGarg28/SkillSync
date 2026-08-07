/**
 * Gets the initials of a user name
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format a time range string
 * @param {string} startTime 
 * @param {string} endTime 
 * @returns {string}
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${startTime} - ${endTime}`;
};
