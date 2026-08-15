const express = require('express');
const router = express.Router();
const { protect, admin, requireSuperAdmin } = require('../middleware/auth');
const {
  getAnalytics,
  getAllUsers,
  getUserActivity,
  toggleBlockUser,
  updateUserRole,
  getPendingSkills,
  verifySkillProof,
  getAllReports,
  handleReportAction,
  getAllSessions,
  cancelSession,
  exportData,
  getAllDisputes,
  resolveDispute,
  getAllReviews,
  deleteReview,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getHealth,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  getAuditLogs,
} = require('../controllers/adminController');

// All admin routes require protect and admin role
router.use(protect);
router.use(admin);

// Feature 1: Verify Skills
router.get('/pending-skills', getPendingSkills);
router.put('/users/:id/verify-skill', verifySkillProof);

// Feature 2: Manage Users
router.get('/users', getAllUsers);
router.get('/users/:id/activity', getUserActivity);
router.put('/users/:id/block', toggleBlockUser);
// Super Admin only for updating user admin role
router.put('/users/:id/role', requireSuperAdmin, updateUserRole);

// Feature 3: Manage Abuse Reports
router.get('/reports', getAllReports);
router.put('/reports/:id/action', handleReportAction);

// Feature 4: Manage Sessions
router.get('/sessions', getAllSessions);
router.put('/sessions/:id/cancel', cancelSession);

// Feature 5 & 11: Analytics & CSV Export
router.get('/analytics', getAnalytics);
router.get('/export/:type', exportData);

// Feature 6: Dispute Resolution
router.get('/disputes', getAllDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

// Feature 7: Manage Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Feature 8: Manage Skill Categories (Mutation is Super Admin only)
router.get('/categories', getCategories);
router.post('/categories', requireSuperAdmin, createCategory);
router.put('/categories/:id', requireSuperAdmin, updateCategory);
router.delete('/categories/:id', requireSuperAdmin, deleteCategory);

// Feature 9: System Health Monitoring (Super Admin only)
router.get('/health', requireSuperAdmin, getHealth);

// Feature 12: Platform Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id/toggle', toggleAnnouncement);

// Feature 13: Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
