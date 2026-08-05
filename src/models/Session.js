const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    proposedTime: {
      type: Date,
      required: true,
    },
    confirmedTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
    },
    videoCallLink: {
      type: String,
      default: '',
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionNote',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
