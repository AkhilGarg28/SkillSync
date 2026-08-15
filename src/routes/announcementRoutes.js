const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Public route to list active platform announcements
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
