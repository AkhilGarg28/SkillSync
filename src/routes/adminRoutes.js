const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAnalytics,
  getAllUsers,
  toggleBlockUser,
  verifyUserIdentity,
  verifySkillProof,
  getAllReports,
  resolveReport,
  getAllSessions,
} = require('../controllers/adminController');

// All admin routes require protect and admin role
router.use(protect);
router.use(admin);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/verify-identity', verifyUserIdentity);
router.put('/users/:id/verify-skill', verifySkillProof);

router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

router.get('/sessions', getAllSessions);

module.exports = router;
