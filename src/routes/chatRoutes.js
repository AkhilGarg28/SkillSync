const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkMatchAccepted } = require('../middleware/matchAcceptanceGuard');
const {
  createChatMessage,
  uploadChatFile,
  getChatFileScoped,
  getChatMessageById,
  updateChatMessage,
  getChatMessagesByUser,
  getChatMessagesBySession,
  uploadMiddleware,
} = require('../controllers/chatController');

router.use(protect);

router.get('/files/download/:filename', getChatFileScoped);

router.post('/upload', checkMatchAccepted, uploadMiddleware.single('file'), uploadChatFile);

router.post('/', checkMatchAccepted, createChatMessage);
router.get('/session/:sessionId', checkMatchAccepted, getChatMessagesBySession);
router.get('/user/:userId', getChatMessagesByUser);
router.get('/:id', getChatMessageById);
router.put('/:id', checkMatchAccepted, updateChatMessage);

module.exports = router;
