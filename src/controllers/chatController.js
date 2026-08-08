const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ChatMessage = require('../models/ChatMessage');
const Session = require('../models/Session');
const Match = require('../models/Match');

const uploadDir = path.join(__dirname, '../../uploads/chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and documents (PDF, TXT, DOC, DOCX) are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const verifyParticipant = async (sessionId, matchId, userId) => {
  if (!userId) return false;
  const current = userId.toString();

  if (sessionId) {
    const session = await Session.findById(sessionId);
    if (session) {
      const u1 = session.user1Id ? session.user1Id.toString() : (session.user1 ? session.user1.toString() : '');
      const u2 = session.user2Id ? session.user2Id.toString() : (session.user2 ? session.user2.toString() : '');
      return current === u1 || current === u2;
    }
  }

  if (matchId) {
    const match = await Match.findById(matchId);
    if (match) {
      const u1 = match.user1Id ? match.user1Id.toString() : (match.user1 ? match.user1.toString() : '');
      const u2 = match.user2Id ? match.user2Id.toString() : (match.user2 ? match.user2.toString() : '');
      return current === u1 || current === u2;
    }
  }

  return false;
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.createChatMessage = async (req, res) => {
  try {
    const { sessionId, matchId, senderId, messageText, fileAttachment } = req.body;
    const finalSenderId = senderId || (req.user ? (req.user._id || req.user.id) : null);
    const finalMatchId = matchId || sessionId;
    const finalSessionId = sessionId || matchId;

    const message = new ChatMessage({
      sessionId: finalSessionId,
      matchId: finalMatchId,
      senderId: finalSenderId,
      messageText: messageText || '',
      fileAttachment: fileAttachment || null,
    });
    const savedMessage = await message.save();
    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded or file validation failed.' });
    }

    const { sessionId, matchId } = req.body;
    const senderId = req.user ? (req.user._id || req.user.id) : req.body.senderId;
    const finalMatchId = matchId || sessionId;
    const finalSessionId = sessionId || matchId;

    const fileAttachment = {
      fileName: req.file.originalname,
      fileUrl: `/api/chat-messages/files/download/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    };

    const message = new ChatMessage({
      sessionId: finalSessionId,
      matchId: finalMatchId,
      senderId,
      messageText: req.body.messageText || '',
      fileAttachment,
    });

    const savedMessage = await message.save();
    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatFileScoped = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized: Missing user identity.' });
    }

    const safeFilename = escapeRegex(filename);
    const message = await ChatMessage.findOne({
      'fileAttachment.fileUrl': { $regex: safeFilename, $options: 'i' },
    });

    if (!message) {
      return res.status(404).json({ success: false, error: 'File attachment not found.' });
    }

    const isAuth = await verifyParticipant(message.sessionId, message.matchId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to access files from this match.',
      });
    }

    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File on disk not found.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatMessageById = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Chat message not found' });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateChatMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!message) {
      return res.status(404).json({ success: false, error: 'Chat message not found' });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatMessagesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await ChatMessage.find({ senderId: userId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatMessagesBySession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const messages = await ChatMessage.find({
      $or: [{ sessionId }, { matchId: sessionId }],
    }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.uploadMiddleware = upload;
