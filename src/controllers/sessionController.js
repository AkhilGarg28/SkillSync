const Session = require('../models/Session');
const { validateMutualAvailability } = require('../utils/availabilityValidator');
const { generateVideoCallLink } = require('../utils/videoLinkGenerator');

function validateStateTransition(currentStatus, action, session) {
  const now = new Date();
  const sessionTime = session.confirmedTime || session.proposedTime;

  switch (currentStatus) {
    case 'requested':
      if (action === 'accept') {
        return { valid: true, newStatus: 'confirmed', setConfirmedTime: true, generateLink: true };
      }
      if (action === 'decline' || action === 'cancel') {
        return { valid: true, newStatus: 'cancelled' };
      }
      return {
        valid: false,
        reason: `Cannot perform action '${action}' on a session in 'requested' state. Only 'accept', 'decline', or 'cancel' are allowed.`,
      };

    case 'confirmed':
      if (action === 'complete') {
        return { valid: true, newStatus: 'completed' };
      }
      if (action === 'cancel') {
        if (sessionTime && now >= new Date(sessionTime)) {
          return {
            valid: false,
            reason: 'Cannot cancel a confirmed session after the session time has passed.',
          };
        }
        return { valid: true, newStatus: 'cancelled' };
      }
      return {
        valid: false,
        reason: `Cannot perform action '${action}' on a session in 'confirmed' state. Only 'complete' or 'cancel' (before session time) are allowed.`,
      };

    case 'completed':
      return {
        valid: false,
        reason: 'Session is already completed. No state transitions are allowed from terminal state.',
      };

    case 'cancelled':
      return {
        valid: false,
        reason: 'Session is already cancelled. No state transitions are allowed from terminal state.',
      };

    default:
      return { valid: false, reason: `Unknown current session status: '${currentStatus}'` };
  }
}

exports.proposeSession = async (req, res) => {
  try {
    let {
      user1Id,
      user2Id,
      matchId,
      proposedTime,
      user1Availability,
      user2Availability,
      durationMinutes = 60,
    } = req.body;

    if (matchId && (!user1Id || !user2Id)) {
      const Match = require('../models/Match');
      const matchDoc = await Match.findById(matchId);
      if (matchDoc) {
        user1Id = user1Id || matchDoc.user1Id || matchDoc.user1;
        user2Id = user2Id || matchDoc.user2Id || matchDoc.user2;
      }
    }

    user1Id = user1Id || (req.user ? req.user.id : null);

    if (!user1Id || !user2Id || !proposedTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user1Id, user2Id, and proposedTime are required.',
      });
    }

    if (user1Availability && user2Availability) {
      const validation = validateMutualAvailability(
        proposedTime,
        user1Availability,
        user2Availability,
        durationMinutes
      );

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Proposed time rejected: ${validation.reason}`,
        });
      }
    }

    const newSession = new Session({
      user1Id,
      user2Id,
      matchId,
      proposedTime: new Date(proposedTime),
      status: 'requested',
    });

    newSession.videoCallLink = generateVideoCallLink(newSession._id);

    const savedSession = await newSession.save();
    return res.status(201).json({ success: true, data: savedSession });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.respondToSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: "Missing required 'action' field (accept, decline, cancel, or complete).",
      });
    }

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const transition = validateStateTransition(session.status, action, session);

    if (!transition.valid) {
      return res.status(400).json({
        success: false,
        error: `State transition rejected: ${transition.reason}`,
      });
    }

    session.status = transition.newStatus;
    if (transition.setConfirmedTime) {
      session.confirmedTime = session.proposedTime;
    }

    if (transition.generateLink || (session.status === 'confirmed' && !session.videoCallLink)) {
      session.videoCallLink = generateVideoCallLink(session._id);
    }

    const updatedSession = await session.save();
    return res.status(200).json({ success: true, data: updatedSession });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const session = new Session(req.body);
    const savedSession = await session.save();
    res.status(201).json({ success: true, data: savedSession });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('notes');
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user ? req.user.id : null);
    let query = Session.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    }).sort({ createdAt: -1 });

    if (typeof query.populate === 'function') {
      query = query.populate('user1Id', 'name email profilePhoto city timezone')
                   .populate('user2Id', 'name email profilePhoto city timezone');
    }

    const sessions = await query;
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateZoomLink = async (req, res) => {
  try {
    const { zoomUrl } = req.body;
    if (!zoomUrl) {
      return res.status(400).json({ success: false, error: 'zoomUrl is required.' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    session.zoomUrl = zoomUrl;
    session.videoCallLink = zoomUrl;
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('user1Id', 'name email profilePhoto city timezone')
      .populate('user2Id', 'name email profilePhoto city timezone');

    res.status(200).json({ success: true, message: 'Zoom URL updated successfully.', data: populatedSession });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.disputeSession = async (req, res) => {
  try {
    const { reason, details, initiatorComment } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason for dispute is required.' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const currentUserId = req.user ? String(req.user.id) : null;
    const user1Str = String(session.user1Id);
    const user2Str = String(session.user2Id);

    if (currentUserId && currentUserId !== user1Str && currentUserId !== user2Str) {
      return res.status(403).json({ success: false, error: 'Forbidden: You are not a participant in this session.' });
    }

    const respondentId = currentUserId === user1Str ? session.user2Id : session.user1Id;
    const Dispute = require('../models/Dispute');

    const dispute = await Dispute.create({
      sessionId: session._id,
      initiatorId: currentUserId || session.user1Id,
      respondentId,
      reason,
      details: details || '',
      initiatorComment: initiatorComment || details || '',
      status: 'pending',
    });

    session.status = 'disputed';
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session flagged for dispute resolution.',
      data: dispute,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
