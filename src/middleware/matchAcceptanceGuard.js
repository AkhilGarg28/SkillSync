const Match = require('../models/Match');
const Session = require('../models/Session');
const ChatMessage = require('../models/ChatMessage');

async function verifyMatchAcceptance(matchId, sessionId) {
  if (matchId) {
    const match = await Match.findById(matchId);
    if (match && (match.status === 'accepted' || match.status === 'ACCEPTED')) {
      return { accepted: true, match };
    }
    if (match && match.status !== 'accepted' && match.status !== 'ACCEPTED') {
      return { accepted: false, reason: `Match status is '${match.status}'. Chat is locked until match is accepted.` };
    }
  }

  if (sessionId) {
    const session = await Session.findById(sessionId);
    if (session) {
      if (session.matchId) {
        const parentMatch = await Match.findById(session.matchId);
        if (parentMatch && (parentMatch.status === 'accepted' || parentMatch.status === 'ACCEPTED')) {
          return { accepted: true, session, match: parentMatch };
        }
      }
      if (session.status === 'confirmed' || session.status === 'completed' || session.status === 'accepted') {
        return { accepted: true, session };
      }
      return {
        accepted: false,
        reason: `Session status is '${session.status}'. Chat is locked until match is accepted.`,
      };
    }

    // Also check if sessionId parameter was actually a Match ID
    const match = await Match.findById(sessionId);
    if (match && (match.status === 'accepted' || match.status === 'ACCEPTED')) {
      return { accepted: true, match };
    }
    if (match && match.status !== 'accepted' && match.status !== 'ACCEPTED') {
      return { accepted: false, reason: `Match status is '${match.status}'. Chat is locked until match is accepted.` };
    }
  }

  return { accepted: false, reason: 'Match or Session not found.' };
}

const checkMatchAccepted = async (req, res, next) => {
  try {
    let matchId = req.body.matchId || req.params.matchId || req.query.matchId;
    let sessionId = req.body.sessionId || req.params.sessionId || req.query.sessionId;

    if (!matchId && !sessionId && req.params.id) {
      const msg = await ChatMessage.findById(req.params.id);
      if (msg) {
        matchId = msg.matchId;
        sessionId = msg.sessionId;
      }
    }

    if (!matchId && !sessionId) {
      return next();
    }

    const result = await verifyMatchAcceptance(matchId, sessionId);

    if (!result.accepted) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: ${result.reason}`,
      });
    }

    req.match = result.match;
    req.session = result.session;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkMatchAccepted,
  verifyMatchAcceptance,
};
