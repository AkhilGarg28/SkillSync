const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  markNotificationRead,
} = require('../controllers/notificationController');

router.use(protect);

router.get('/user/:userId', getUserNotifications);
router.put('/:id/read', markNotificationRead);

module.exports = router;
