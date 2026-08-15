const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

/**
 * Record an administrative audit log entry.
 * @param {Object} adminUser - req.user or admin user document
 * @param {string} action - Action name (e.g. BLOCK_USER, VERIFY_SKILL, RESOLVE_REPORT)
 * @param {string} targetType - Resource type (e.g. User, Report, Skill, Category)
 * @param {string} targetId - Target identifier
 * @param {Object} details - Metadata/context object
 */
const logAdminAction = async (adminUser, action, targetType, targetId = '', details = {}) => {
  try {
    if (!adminUser) return;
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        adminId: adminUser.id || adminUser._id,
        adminEmail: adminUser.email || adminUser.name || 'admin@skillsync.com',
        action,
        targetType,
        targetId: String(targetId),
        details,
      });
    }
  } catch (error) {
    console.error('Failed to create audit log entry:', error.message);
  }
};

module.exports = { logAdminAction };
