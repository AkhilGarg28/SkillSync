const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSessionNote,
  getSessionNoteById,
  updateSessionNote,
  getSessionNotesBySession,
  getSessionNotesByUser,
  addMilestone,
  toggleMilestone,
} = require('../controllers/noteController');

router.use(protect);

router.post('/', createSessionNote);
router.get('/session/:sessionId', getSessionNotesBySession);
router.get('/user/:userId', getSessionNotesByUser);
router.get('/:id', getSessionNoteById);
router.put('/:id', updateSessionNote);
router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:milestoneId', toggleMilestone);

module.exports = router;
