const { Server } = require('socket.io');
const ChatMessage = require('../models/ChatMessage');
const { verifyMatchAcceptance } = require('../middleware/matchAcceptanceGuard');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_room', async (data) => {
      const { sessionId, matchId, userId } = data || {};
      const roomId = sessionId ? `session_${sessionId}` : `match_${matchId}`;

      const check = await verifyMatchAcceptance(matchId, sessionId);
      if (!check.accepted) {
        socket.emit('error_message', {
          success: false,
          error: `Chat Access Denied (403): ${check.reason}`,
        });
        return;
      }

      socket.join(roomId);
      socket.emit('room_joined', { roomId, success: true });
    });

    socket.on('send_message', async (data) => {
      const { sessionId, matchId, senderId, messageText, fileAttachment } = data || {};
      const roomId = sessionId ? `session_${sessionId}` : `match_${matchId}`;

      const check = await verifyMatchAcceptance(matchId, sessionId);
      if (!check.accepted) {
        socket.emit('error_message', {
          success: false,
          error: `Message Rejected (403): ${check.reason}`,
        });
        return;
      }

      try {
        const message = new ChatMessage({
          sessionId,
          matchId,
          senderId,
          messageText: messageText || '',
          fileAttachment: fileAttachment || null,
          timestamp: new Date(),
        });

        const savedMessage = await message.save();
        io.to(roomId).emit('receive_message', savedMessage);
      } catch (err) {
        socket.emit('error_message', { success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
