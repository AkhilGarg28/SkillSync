const User = require('../models/User');
const Match = require('../models/Match');
const Session = require('../models/Session');
const Report = require('../models/Report');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalMatches = await Match.countDocuments();
    const acceptedMatches = await Match.countDocuments({ status: 'accepted' });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Popular skills aggregate
    const users = await User.find().select('skillsToTeach skillsToLearn');
    const skillCounts = {};
    users.forEach((u) => {
      (u.skillsToTeach || []).forEach((s) => {
        const name = s.skillName;
        if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
      });
    });

    const popularSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        blockedUsers,
        totalMatches,
        acceptedMatches,
        totalSessions,
        completedSessions,
        pendingReports,
        popularSkills,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Block / Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      data: { id: user._id, isBlocked: user.isBlocked },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve or Reject Teacher/User Identity Verification
// @route   PUT /api/admin/users/:id/verify-identity
// @access  Private (Admin)
exports.verifyUserIdentity = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    user.verificationStatus = status;
    user.isVerified = status === 'approved';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User identity verification set to ${status}.`,
      data: { id: user._id, verificationStatus: user.verificationStatus, isVerified: user.isVerified },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve or Reject Skill Proof for a User's Skill
// @route   PUT /api/admin/users/:id/verify-skill
// @access  Private (Admin)
exports.verifySkillProof = async (req, res) => {
  try {
    const { skillName, status } = req.body; // status: 'approved' or 'rejected'
    if (!skillName || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'skillName and valid status (approved/rejected) are required.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const skillIndex = user.skillsToTeach.findIndex(
      (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (skillIndex === -1) {
      return res.status(404).json({ success: false, error: 'Skill not found on user profile.' });
    }

    user.skillsToTeach[skillIndex].proofStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Skill ${skillName} proof set to ${status}.`,
      data: user.skillsToTeach[skillIndex],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email isBlocked')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve or dismiss a report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin)
exports.resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be resolved or dismissed.' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    res.status(200).json({ success: true, message: `Report marked as ${status}.`, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all global sessions for admin auditing
// @route   GET /api/admin/sessions
// @access  Private (Admin)
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('user1Id', 'name email')
      .populate('user2Id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
