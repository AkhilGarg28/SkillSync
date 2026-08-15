const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSession,
  getSessionById,
  updateSession,
  getSessionsByUser,
  proposeSession,
  respondToSession,
  updateZoomLink,
  disputeSession,
} = require('../controllers/sessionController');

router.get('/my-sessions', protect, getSessionsByUser);
router.post('/propose', proposeSession);
router.put('/:id/respond', respondToSession);
router.put('/:id/zoom-link', protect, updateZoomLink);
router.post('/:id/dispute', protect, disputeSession);

router.post('/', createSession);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.get('/user/:userId', getSessionsByUser);

module.exports = router;
