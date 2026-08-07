const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleCallback,
} = require('../controllers/authController');

// Local auth routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/login', session: false }),
  googleCallback
);

module.exports = router;
