const User = require('../models/User');
const { calculateUserBadges } = require('../services/badgeService');

// @desc    Get badges for a user
// @route   GET /api/users/:id/badges
// @access  Private
exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    const badges = await calculateUserBadges(req.params.id);

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
