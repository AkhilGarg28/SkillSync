const User = require('../models/User');
const Match = require('../models/Match');
const Session = require('../models/Session');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const SkillCategory = require('../models/SkillCategory');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { logAdminAction } = require('../utils/auditLogger');
const mongoose = require('mongoose');

// Captured error log queue for System Health Monitoring
const recentErrorLogs = [];
const pushSystemErrorLog = (errorMsg, stack = '') => {
  recentErrorLogs.unshift({ message: errorMsg, stack: stack.slice(0, 300), timestamp: new Date() });
  if (recentErrorLogs.length > 50) recentErrorLogs.pop();
};

// --- Feature 1: Verify Skills ---
exports.getPendingSkills = async (req, res) => {
  try {
    const users = await User.find({
      'skillsToTeach.proofStatus': 'pending',
    }).select('name email skillsToTeach profilePhoto');

    const pendingQueue = [];
    users.forEach((u) => {
      (u.skillsToTeach || []).forEach((s) => {
        if (s.proofStatus === 'pending') {
          pendingQueue.push({
            userId: u._id,
            userName: u.name,
            userEmail: u.email,
            profilePhoto: u.profilePhoto,
            skillName: s.skillName,
            experienceLevel: s.experienceLevel,
            proofLink: s.proofLink,
            proofStatus: s.proofStatus,
            rejectionReason: s.rejectionReason || '',
          });
        }
      });
    });

    res.status(200).json({ success: true, count: pendingQueue.length, data: pendingQueue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifySkillProof = async (req, res) => {
  try {
    const { skillName, status, rejectionReason } = req.body;
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
    if (status === 'rejected') {
      user.skillsToTeach[skillIndex].rejectionReason = rejectionReason || 'Proof document did not meet verification criteria.';
    } else {
      user.skillsToTeach[skillIndex].rejectionReason = '';
    }

    await user.save();

    await Notification.create({
      userId: user._id,
      type: 'system',
      title: `Skill Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved' 
        ? `Your skill "${skillName}" has been verified by administrators!` 
        : `Your skill "${skillName}" verification request was rejected: ${user.skillsToTeach[skillIndex].rejectionReason}`,
    }).catch(() => {});

    await logAdminAction(req.user, 'VERIFY_SKILL', 'User', user._id, { skillName, status, rejectionReason });

    res.status(200).json({
      success: true,
      message: `Skill ${skillName} proof set to ${status}.`,
      data: user.skillsToTeach[skillIndex],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 2: Manage Users ---
exports.getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    let queryFilter = {};

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'blocked') queryFilter.isBlocked = true;
    if (status === 'verified') queryFilter.isVerified = true;
    if (status === 'admin') queryFilter.role = 'admin';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(queryFilter);
    const users = await User.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const matchesCount = await Match.countDocuments({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    const sessionsCount = await Session.countDocuments({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    const reviewsGiven = await Review.countDocuments({ reviewerId: userId });
    const reviewsReceived = await Review.find({ revieweeId: userId });
    const avgRating = reviewsReceived.length
      ? (reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / reviewsReceived.length).toFixed(1)
      : 'N/A';

    const reportsAgainstUser = await Report.find({ reportedUserId: userId })
      .populate('reporterId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        user,
        activity: {
          matchesCount,
          sessionsCount,
          reviewsGiven,
          reviewsReceivedCount: reviewsReceived.length,
          avgRating,
          reportsAgainstUser,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await logAdminAction(req.user, user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', 'User', user._id, {
      userEmail: user.email,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      data: { id: user._id, isBlocked: user.isBlocked },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role, adminRole } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }
    if (adminRole && ['super_admin', 'support_admin'].includes(adminRole)) {
      user.adminRole = adminRole;
    }

    await user.save();
    await logAdminAction(req.user, 'UPDATE_USER_ROLE', 'User', user._id, { role: user.role, adminRole: user.adminRole });

    res.status(200).json({
      success: true,
      message: `User role updated successfully to ${user.role} (${user.adminRole}).`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 3: Manage Reports ---
exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    let queryFilter = {};
    if (status) queryFilter.status = status;

    const reports = await Report.find(queryFilter)
      .populate('reporterId', 'name email profilePhoto')
      .populate('reportedUserId', 'name email profilePhoto isBlocked')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.handleReportAction = async (req, res) => {
  try {
    const { action, resolutionNotes } = req.body; // action: 'warn' | 'block' | 'dismiss'
    if (!['warn', 'block', 'dismiss'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be warn, block, or dismiss.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    report.details = (report.details ? report.details + '\n' : '') + `[Admin Action (${action.toUpperCase()}): ${resolutionNotes || 'No notes'}]`;
    await report.save();

    if (action === 'warn') {
      await Notification.create({
        userId: report.reportedUserId,
        type: 'system',
        title: 'Community Guidelines Warning',
        message: `An administrator has issued a formal warning regarding a recent report: ${resolutionNotes || 'Please adhere to SkillSync community rules.'}`,
      }).catch(() => {});
    }

    if (action === 'block') {
      await User.findByIdAndUpdate(report.reportedUserId, { isBlocked: true });
    }

    await logAdminAction(req.user, `RESOLVE_REPORT_${action.toUpperCase()}`, 'Report', report._id, {
      reportedUserId: report.reportedUserId,
      resolutionNotes,
    });

    res.status(200).json({ success: true, message: `Report handled with action: ${action}.`, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 4: Manage Sessions ---
exports.getAllSessions = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let queryFilter = {};

    if (status) queryFilter.status = status;
    if (startDate || endDate) {
      queryFilter.proposedTime = {};
      if (startDate) queryFilter.proposedTime.$gte = new Date(startDate);
      if (endDate) queryFilter.proposedTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(queryFilter)
      .populate('user1Id', 'name email profilePhoto')
      .populate('user2Id', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    session.status = 'cancelled';
    await session.save();

    const notifyReason = reason || 'Cancelled by administrative moderation.';
    await Notification.create({
      userId: session.user1Id,
      type: 'session',
      title: 'Session Cancelled by Admin',
      message: `Your scheduled session was cancelled: ${notifyReason}`,
    }).catch(() => {});

    await Notification.create({
      userId: session.user2Id,
      type: 'session',
      title: 'Session Cancelled by Admin',
      message: `Your scheduled session was cancelled: ${notifyReason}`,
    }).catch(() => {});

    await logAdminAction(req.user, 'CANCEL_SESSION', 'Session', session._id, { reason });

    res.status(200).json({ success: true, message: 'Session cancelled successfully by admin.', data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 5 & 11: Analytics & CSV Export ---
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

    // Top skills aggregate
    const users = await User.find().select('skillsToTeach skillsToLearn');
    const teachCounts = {};
    const learnCounts = {};
    users.forEach((u) => {
      (u.skillsToTeach || []).forEach((s) => {
        if (s.skillName) teachCounts[s.skillName] = (teachCounts[s.skillName] || 0) + 1;
      });
      (u.skillsToLearn || []).forEach((s) => {
        if (s.skillName) learnCounts[s.skillName] = (learnCounts[s.skillName] || 0) + 1;
      });
    });

    const popularSkills = Object.entries(teachCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topWantedSkills = Object.entries(learnCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Simple user growth over past 6 months
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await User.countDocuments({ createdAt: { $gte: d, $lt: nextD } });
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      months.push({ month: monthLabel, count });
    }

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
        topWantedSkills,
        userGrowth: months,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const { type } = req.params; // 'users' | 'sessions' | 'matches' | 'analytics'
    let csvString = '';

    if (type === 'users') {
      const users = await User.find().select('name email role isVerified isBlocked createdAt');
      csvString = 'ID,Name,Email,Role,IsVerified,IsBlocked,CreatedAt\n' +
        users.map(u => `"${u._id}","${u.name}","${u.email}","${u.role}",${u.isVerified},${u.isBlocked},"${u.createdAt.toISOString()}"`).join('\n');
    } else if (type === 'sessions') {
      const sessions = await Session.find()
        .populate('user1Id', 'email')
        .populate('user2Id', 'email');
      csvString = 'ID,User1,User2,Status,ProposedTime,CreatedAt\n' +
        sessions.map(s => `"${s._id}","${s.user1Id?.email || ''}","${s.user2Id?.email || ''}","${s.status}","${s.proposedTime?.toISOString()}","${s.createdAt.toISOString()}"`).join('\n');
    } else if (type === 'matches') {
      const matches = await Match.find();
      csvString = 'ID,User1,User2,Status,CreatedAt\n' +
        matches.map(m => `"${m._id}","${m.user1Id}","${m.user2Id}","${m.status}","${m.createdAt.toISOString()}"`).join('\n');
    } else {
      const totalUsers = await User.countDocuments();
      const totalMatches = await Match.countDocuments();
      const totalSessions = await Session.countDocuments();
      csvString = `Metric,Value\nTotal Users,${totalUsers}\nTotal Matches,${totalMatches}\nTotal Sessions,${totalSessions}\nExported At,${new Date().toISOString()}`;
    }

    await logAdminAction(req.user, 'EXPORT_DATA', 'Export', type, { type });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=skillsync_${type}_export.csv`);
    return res.status(200).send(csvString);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 6: Dispute Resolution ---
exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('sessionId')
      .populate('initiatorId', 'name email profilePhoto')
      .populate('respondentId', 'name email profilePhoto')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { outcome, adminNotes } = req.body;
    if (!['no_action', 'warn_initiator', 'warn_respondent', 'warn_both', 'void_session'].includes(outcome)) {
      return res.status(400).json({ success: false, error: 'Valid outcome is required.' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute not found.' });
    }

    dispute.status = 'resolved';
    dispute.outcome = outcome;
    dispute.adminNotes = adminNotes || '';
    dispute.resolvedBy = req.user.id;
    await dispute.save();

    if (outcome === 'void_session') {
      await Session.findByIdAndUpdate(dispute.sessionId, { status: 'cancelled' });
    } else {
      await Session.findByIdAndUpdate(dispute.sessionId, { status: 'completed' });
    }

    await Notification.create({
      userId: dispute.initiatorId,
      type: 'session',
      title: 'Dispute Resolved',
      message: `Your session dispute resolution: ${outcome.replace('_', ' ').toUpperCase()}. Admin notes: ${adminNotes || 'None'}`,
    }).catch(() => {});

    await Notification.create({
      userId: dispute.respondentId,
      type: 'session',
      title: 'Dispute Resolved',
      message: `Your session dispute resolution: ${outcome.replace('_', ' ').toUpperCase()}. Admin notes: ${adminNotes || 'None'}`,
    }).catch(() => {});

    await logAdminAction(req.user, 'RESOLVE_DISPUTE', 'Dispute', dispute._id, { outcome, adminNotes });

    res.status(200).json({ success: true, message: `Dispute resolved with outcome: ${outcome}.`, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 7: Manage Reviews ---
exports.getAllReviews = async (req, res) => {
  try {
    const { rating, search } = req.query;
    let queryFilter = {};
    if (rating) queryFilter.rating = parseInt(rating, 10);

    const reviews = await Review.find(queryFilter)
      .populate('reviewerId', 'name email profilePhoto')
      .populate('revieweeId', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    let filteredReviews = reviews;
    if (search) {
      const term = search.toLowerCase();
      filteredReviews = reviews.filter(r => 
        r.reviewerId?.name?.toLowerCase().includes(term) ||
        r.revieweeId?.name?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({ success: true, count: filteredReviews.length, data: filteredReviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    await logAdminAction(req.user, 'DELETE_REVIEW', 'Review', req.params.id, {
      revieweeId: review.revieweeId,
      rating: review.rating,
    });

    res.status(200).json({ success: true, message: 'Abusive/fake review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 8: Manage Skill Categories ---
exports.getCategories = async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const existing = await SkillCategory.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category name already exists.' });
    }

    const category = await SkillCategory.create({ name, description, icon });
    await logAdminAction(req.user, 'CREATE_CATEGORY', 'SkillCategory', category._id, { name });

    res.status(201).json({ success: true, message: 'Skill category created.', data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const category = await SkillCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    await logAdminAction(req.user, 'UPDATE_CATEGORY', 'SkillCategory', category._id, { name });

    res.status(200).json({ success: true, message: 'Skill category updated.', data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { reassignToCategoryName } = req.body;
    const category = await SkillCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    // Check if skills match this category name in user profiles
    const usersWithCategory = await User.find({
      $or: [
        { 'skillsToTeach.skillName': new RegExp(`^${category.name}$`, 'i') },
        { 'skillsToLearn.skillName': new RegExp(`^${category.name}$`, 'i') },
      ],
    });

    if (usersWithCategory.length > 0 && !reassignToCategoryName) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category "${category.name}" because ${usersWithCategory.length} user profile(s) reference it. Please supply reassignToCategoryName to safely reassign referenced skills.`,
        inUseCount: usersWithCategory.length,
      });
    }

    if (usersWithCategory.length > 0 && reassignToCategoryName) {
      for (const u of usersWithCategory) {
        (u.skillsToTeach || []).forEach((s) => {
          if (s.skillName.toLowerCase() === category.name.toLowerCase()) {
            s.skillName = reassignToCategoryName;
          }
        });
        (u.skillsToLearn || []).forEach((s) => {
          if (s.skillName.toLowerCase() === category.name.toLowerCase()) {
            s.skillName = reassignToCategoryName;
          }
        });
        await u.save();
      }
    }

    await SkillCategory.findByIdAndDelete(req.params.id);
    await logAdminAction(req.user, 'DELETE_CATEGORY', 'SkillCategory', req.params.id, {
      name: category.name,
      reassignToCategoryName,
    });

    res.status(200).json({ success: true, message: `Category "${category.name}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 9: System Health Monitoring ---
exports.getHealth = async (req, res) => {
  try {
    const activeSessionsCount = await Session.countDocuments({
      status: { $in: ['requested', 'confirmed'] },
    });

    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      data: {
        backendStatus: 'OK',
        dbStatus,
        activeSessionsCount,
        uptimeSeconds: Math.floor(uptimeSeconds),
        memoryMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        recentErrors: recentErrorLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 12: Platform Announcements ---
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      createdBy: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await logAdminAction(req.user, 'CREATE_ANNOUNCEMENT', 'Announcement', announcement._id, { title });

    res.status(201).json({ success: true, message: 'Announcement created successfully.', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    await logAdminAction(req.user, 'TOGGLE_ANNOUNCEMENT', 'Announcement', announcement._id, { isActive: announcement.isActive });

    res.status(200).json({ success: true, message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'}.`, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Feature 13: Audit Logs ---
exports.getAuditLogs = async (req, res) => {
  try {
    const { adminEmail, action, targetType } = req.query;
    let queryFilter = {};

    if (adminEmail) queryFilter.adminEmail = new RegExp(adminEmail, 'i');
    if (action) queryFilter.action = action;
    if (targetType) queryFilter.targetType = targetType;

    const logs = await AuditLog.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.pushSystemErrorLog = pushSystemErrorLog;
