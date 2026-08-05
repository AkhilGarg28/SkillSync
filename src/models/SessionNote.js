const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isDone: { type: Boolean, default: false },
  },
  { _id: true }
);

const sessionNoteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
