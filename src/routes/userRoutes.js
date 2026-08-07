const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  addTeachSkill,
  addLearnSkill,
} = require('../controllers/userController');
const { getUserBadges } = require('../controllers/badgeController');

// Protect all routes within this router
router.use(protect);

// User Profile routes
router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);
router.post('/:id/skills-teach', addTeachSkill);
router.post('/:id/skills-learn', addLearnSkill);
router.get('/:id/badges', getUserBadges);

module.exports = router;
