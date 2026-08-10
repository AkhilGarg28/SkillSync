const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/chatSocket');
const { startReminderCron } = require('./src/services/reminderService');

const passport = require('passport');
require('./src/config/passport');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const verificationRoutes = require('./src/routes/verificationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const forumRoutes = require('./src/routes/forumRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const path = require('path');

const app = express();
const server = http.createServer(app);

initSocket(server);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'https://skill-sync-chi-three.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat-messages', chatRoutes);
app.use('/api/session-notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SkillSync Backend Running'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillSync Module 3 API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Server Error' });
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
