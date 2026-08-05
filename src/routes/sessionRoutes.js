const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionById,
  updateSession,
  getSessionsByUser,
  proposeSession,
  respondToSession,
} = require('../controllers/sessionController');

router.post('/propose', proposeSession);
router.put('/:id/respond', respondToSession);

router.post('/', createSession);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.get('/user/:userId', getSessionsByUser);

module.exports = router;
