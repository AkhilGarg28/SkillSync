const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Submit a report against a user
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, reason, details } = req.body;
    const reporterId = req.user.id;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ success: false, error: 'reportedUserId and reason are required.' });
    }

    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot report yourself.' });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ success: false, error: 'User to report not found.' });
    }

    const report = new Report({
      reporterId,
      reportedUserId,
      reason,
      details: details || '',
    });

    const savedReport = await report.save();
    res.status(201).json({ success: true, message: 'Report submitted successfully.', data: savedReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
