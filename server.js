const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/chatSocket');
const { startReminderCron } = require('./src/services/reminderService');

const matchRoutes = require('../backend/routes/match.route');
const sessionRoutes = require('./src/routes/sessionRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const errorHandler = require('../backend/middleware/errorHandler');

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat-messages', chatRoutes);
app.use('/api/session-notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillSync Module 3 API is running' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  startReminderCron();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.server = server;
