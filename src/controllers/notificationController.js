const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    if (currentUserId && currentUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only view your own notifications.',
      });
    }

    const notifications = await Notification.find({ userId }).sort({ sentAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
