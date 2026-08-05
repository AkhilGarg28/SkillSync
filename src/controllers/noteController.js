const SessionNote = require('../models/SessionNote');
const Session = require('../models/Session');

const verifyParticipant = async (sessionId, userId) => {
  if (!sessionId || !userId) return false;
  const session = await Session.findById(sessionId);
  if (!session) return false;

  const u1 = session.user1Id ? session.user1Id.toString() : '';
  const u2 = session.user2Id ? session.user2Id.toString() : '';
  const current = userId.toString();

  return current === u1 || current === u2;
};

exports.createSessionNote = async (req, res) => {
  try {
    const { sessionId, notes, milestones } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    const isAuth = await verifyParticipant(sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    const note = new SessionNote({
      sessionId,
      authorId: userId,
      notes: notes || '',
      milestones: milestones || [],
    });

    const savedNote = await note.save();

    await Session.findByIdAndUpdate(sessionId, {
      $push: { notes: savedNote._id },
    });

    res.status(201).json({ success: true, data: savedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessionNoteById = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const note = await SessionNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Session note not found' });
    }

    const isAuth = await verifyParticipant(note.sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessionNotesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user ? req.user.id : null;

    const isAuth = await verifyParticipant(sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    const notes = await SessionNote.find({ sessionId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSessionNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const note = await SessionNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Session note not found' });
    }

    const isAuth = await verifyParticipant(note.sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    if (req.body.notes !== undefined) {
      note.notes = req.body.notes;
    }
    if (req.body.milestones !== undefined) {
      note.milestones = req.body.milestones;
    }

    const updatedNote = await note.save();
    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addMilestone = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { text, isDone = false } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Milestone text is required.' });
    }

    const note = await SessionNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Session note not found' });
    }

    const isAuth = await verifyParticipant(note.sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    note.milestones.push({ text, isDone });
    const updatedNote = await note.save();

    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleMilestone = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { id: noteId, milestoneId } = req.params;
    const { isDone, text } = req.body;

    const note = await SessionNote.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Session note not found' });
    }

    const isAuth = await verifyParticipant(note.sessionId, userId);
    if (!isAuth) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a participant in this session.',
      });
    }

    const milestone = note.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, error: 'Milestone not found' });
    }

    if (isDone !== undefined) {
      milestone.isDone = isDone;
    }
    if (text !== undefined) {
      milestone.text = text;
    }

    const updatedNote = await note.save();
    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessionNotesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notes = await SessionNote.find({ authorId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
