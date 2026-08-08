const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitIdentityVerification,
  submitSkillProof,
  uploadMiddleware,
} = require('../controllers/verificationController');

router.use(protect);

router.post('/identity', uploadMiddleware.single('document'), submitIdentityVerification);
router.post('/skill-proof', uploadMiddleware.single('document'), submitSkillProof);

module.exports = router;
