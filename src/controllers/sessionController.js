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
    const {
      user1Id,
      user2Id,
      matchId,
      proposedTime,
      user1Availability,
      user2Availability,
      durationMinutes = 60,
    } = req.body;

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
    const userId = req.params.userId;
    const sessions = await Session.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
