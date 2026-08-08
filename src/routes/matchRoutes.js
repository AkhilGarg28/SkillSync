const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  exploreMatches,
  requestMatch,
  acceptMatch,
  declineMatch,
  completeMatch,
  getSentMatches,
  getReceivedMatches,
  getAcceptedMatches,
  getMyMatches,
  respondToMatch,
} = require('../controllers/matchController');

router.use(protect);

router.get('/explore', exploreMatches);
router.post('/request', requestMatch);
router.patch('/:id/accept', acceptMatch);
router.patch('/:id/decline', declineMatch);
router.patch('/:id/complete', completeMatch);
router.get('/sent', getSentMatches);
router.get('/received', getReceivedMatches);
router.get('/accepted', getAcceptedMatches);
router.get('/mine', getMyMatches);
router.put('/:id/respond', respondToMatch);

module.exports = router;
