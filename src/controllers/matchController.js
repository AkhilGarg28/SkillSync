const User = require('../models/User');
const Match = require('../models/Match');

const getUserId = (userObj) => {
  if (!userObj) return '';
  if (typeof userObj === 'string') return userObj;
  if (userObj._id) return String(userObj._id);
  if (userObj.id) return String(userObj.id);
  return String(userObj);
};

// @desc    Explore candidate peer matches
// @route   GET /api/matches/explore
// @access  Private
exports.exploreMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const { category, timezone, page = 1, limit = 10 } = req.query;

    const currentUser = currentUserId ? await User.findById(currentUserId) : null;
    const currentLearnSkills = currentUser?.skillsToLearn?.map((s) => s.skillName.toLowerCase()) || [];

    let query = { _id: { $ne: currentUserId }, isBlocked: { $ne: true } };
    if (timezone) {
      query.timezone = timezone;
    }

    const allUsers = await User.find(query).select('-password').sort({ createdAt: -1 });

    const candidates = allUsers.map((user) => {
      const userObj = user.toObject();
      const teachSkills = userObj.skillsToTeach || [];
      const matched = teachSkills.filter((s) =>
        currentLearnSkills.length === 0 || currentLearnSkills.includes(s.skillName.toLowerCase())
      );

      return {
        ...userObj,
        matchedSkills: matched.map((m) => m.skillName),
      };
    });

    const filteredCandidates = category
      ? candidates.filter((c) =>
          (c.skillsToTeach || []).some(
            (s) =>
              s.category?.toLowerCase() === category.toLowerCase() ||
              s.skillName?.toLowerCase().includes(category.toLowerCase())
          )
        )
      : candidates;

    const startIndex = (page - 1) * limit;
    const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedCandidates.length,
      hasMore: startIndex + Number(limit) < filteredCandidates.length,
      data: paginatedCandidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send match request to candidate
// @route   POST /api/matches/request
// @access  Private
exports.requestMatch = async (req, res, next) => {
  try {
    const senderId = req.user ? (req.user._id || req.user.id) : req.body.user1Id;
    const { receiverId, targetUserId, candidateId, toUserId, skillOffered, skillRequested, offeredSkill, requestedSkill } = req.body;
    const targetId = receiverId || targetUserId || candidateId || toUserId;

    if (!senderId || !targetId) {
      return res.status(400).json({ success: false, error: 'Target user ID (receiverId) is required.' });
    }

    if (String(senderId) === String(targetId)) {
      return res.status(400).json({ success: false, error: 'Cannot send a swap request to yourself.' });
    }

    const [senderUser, receiverUser] = await Promise.all([
      User.findById(senderId),
      User.findById(targetId),
    ]);

    if (!receiverUser) {
      return res.status(404).json({ success: false, error: 'Target user not found.' });
    }

    const finalSkillOffered = skillOffered || offeredSkill || senderUser?.skillsToTeach?.[0]?.skillName || 'General Skill';
    const finalSkillRequested = skillRequested || requestedSkill || receiverUser?.skillsToTeach?.[0]?.skillName || 'General Skill';

    // Check for active match (pending or accepted) in either direction
    const activeMatch = await Match.findOne({
      $or: [
        { sender: senderId, receiver: targetId },
        { sender: targetId, receiver: senderId },
      ],
      status: { $in: ['pending', 'accepted'] },
    });

    if (activeMatch) {
      return res.status(409).json({
        success: false,
        error: 'An active match or pending request already exists between these users.',
      });
    }

    const match = new Match({
      sender: senderId,
      receiver: targetId,
      skillOffered: finalSkillOffered,
      skillRequested: finalSkillRequested,
      status: 'pending',
    });

    await match.save();

    const populatedMatch = await Match.findById(match._id).populate(
      'sender receiver',
      'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified'
    );

    res.status(201).json({
      success: true,
      message: 'Match request sent successfully.',
      data: populatedMatch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept match request
// @route   PATCH /api/matches/:id/accept
// @access  Private
exports.acceptMatch = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match request not found.' });
    }

    if (String(match.receiver) !== String(currentUserId)) {
      return res.status(403).json({ success: false, error: 'Only the receiver of this match may accept it.' });
    }

    if (match.status !== 'pending') {
      return res.status(409).json({ success: false, error: `Cannot accept match with status '${match.status}'.` });
    }

    const updatedMatch = await Match.findOneAndUpdate(
      { _id: req.params.id, receiver: currentUserId, status: 'pending' },
      { status: 'accepted', respondedAt: new Date() },
      { new: true }
    ).populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified');

    if (!updatedMatch) {
      return res.status(409).json({ success: false, error: 'Match state changed concurrently or unavailable.' });
    }

    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline match request
// @route   PATCH /api/matches/:id/decline
// @access  Private
exports.declineMatch = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match request not found.' });
    }

    if (String(match.receiver) !== String(currentUserId)) {
      return res.status(403).json({ success: false, error: 'Only the receiver of this match may decline it.' });
    }

    if (match.status !== 'pending') {
      return res.status(409).json({ success: false, error: `Cannot decline match with status '${match.status}'.` });
    }

    const updatedMatch = await Match.findOneAndUpdate(
      { _id: req.params.id, receiver: currentUserId, status: 'pending' },
      { status: 'declined', respondedAt: new Date() },
      { new: true }
    ).populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified');

    if (!updatedMatch) {
      return res.status(409).json({ success: false, error: 'Match state changed concurrently or unavailable.' });
    }

    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete match
// @route   PATCH /api/matches/:id/complete
// @access  Private
exports.completeMatch = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match request not found.' });
    }

    const isSender = String(match.sender) === String(currentUserId);
    const isReceiver = String(match.receiver) === String(currentUserId);

    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, error: 'Only the sender or receiver of this match may mark it complete.' });
    }

    if (match.status !== 'accepted') {
      return res.status(409).json({ success: false, error: `Cannot complete match with status '${match.status}'. Only accepted matches can be completed.` });
    }

    const updatedMatch = await Match.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        status: 'accepted',
      },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    ).populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified');

    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent match requests for current user
// @route   GET /api/matches/sent
// @access  Private
exports.getSentMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const { status } = req.query;

    const query = { sender: currentUserId };
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified')
      .sort({ createdAt: -1 });

    const formatted = matches.map((m) => {
      const recipient = m.receiver || {};
      return {
        _id: m._id,
        id: m._id,
        sender: m.sender,
        receiver: m.receiver,
        senderId: m.sender,
        receiverId: recipient._id || recipient.id,
        recipient: {
          id: recipient._id || recipient.id,
          _id: recipient._id || recipient.id,
          name: recipient.name,
          profilePhoto: recipient.profilePhoto,
          city: recipient.city,
          timezone: recipient.timezone,
          skillsToTeach: recipient.skillsToTeach || [],
          skillsToLearn: recipient.skillsToLearn || [],
          isVerified: recipient.isVerified,
        },
        skillOffered: m.skillOffered,
        skillRequested: m.skillRequested,
        requestedSkill: m.skillRequested,
        offeredSkill: m.skillOffered,
        status: m.status,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received match requests for current user
// @route   GET /api/matches/received
// @access  Private
exports.getReceivedMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const { status } = req.query;

    const query = { receiver: currentUserId };
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get accepted matches for current user
// @route   GET /api/matches/accepted
// @access  Private
exports.getAcceptedMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];

    const matches = await Match.find({
      status: 'accepted',
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's matches (grouped by status)
// @route   GET /api/matches/mine
// @access  Private
exports.getMyMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : req.headers['x-user-id'];
    const currentUserIdStr = String(currentUserId);

    const matches = await Match.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .populate('sender receiver', 'name email profilePhoto city timezone skillsToTeach skillsToLearn isVerified')
      .sort({ createdAt: -1 });

    const grouped = {
      pending: [],
      sent: [],
      accepted: [],
      completed: [],
      declined: [],
    };

    matches.forEach((m) => {
      const status = (m.status || 'pending').toLowerCase();
      const senderIdStr = getUserId(m.sender);
      const receiverIdStr = getUserId(m.receiver);

      const isSender = senderIdStr === currentUserIdStr;
      const isReceiver = receiverIdStr === currentUserIdStr;

      if (status === 'pending') {
        if (isReceiver) grouped.pending.push(m);
        if (isSender) grouped.sent.push(m);
      } else if (status === 'accepted') {
        grouped.accepted.push(m);
        if (isSender) grouped.sent.push(m);
      } else if (status === 'declined' || status === 'rejected') {
        grouped.declined.push(m);
        if (isSender) grouped.sent.push(m);
      } else if (status === 'completed') {
        grouped.completed.push(m);
        if (isSender) grouped.sent.push(m);
      }
    });

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to match request (Legacy wrapper)
// @route   PUT /api/matches/:id/respond
// @access  Private
exports.respondToMatch = async (req, res, next) => {
  const { action } = req.body;
  if (action === 'accept') {
    return exports.acceptMatch(req, res, next);
  } else if (action === 'decline') {
    return exports.declineMatch(req, res, next);
  } else if (action === 'complete') {
    return exports.completeMatch(req, res, next);
  } else {
    return res.status(400).json({ success: false, error: "Invalid action. Use 'accept', 'decline', or 'complete'." });
  }
};
