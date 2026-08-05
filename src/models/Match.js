const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ user1Id: 1, user2Id: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
