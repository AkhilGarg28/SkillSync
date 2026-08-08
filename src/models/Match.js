const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillOffered: {
      type: String,
      required: true, // skill sender is offering to teach
    },
    skillRequested: {
      type: String,
      required: true, // skill sender wants to learn from receiver
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
      index: true,
    },
    respondedAt: { type: Date }, // set when accepted/declined
    completedAt: { type: Date }, // set when marked completed
  },
  { timestamps: true } // createdAt, updatedAt
);

// Virtual aliases for backwards compatibility with any existing components/tests
matchSchema.virtual('user1Id').get(function () { return this.sender; });
matchSchema.virtual('user2Id').get(function () { return this.receiver; });
matchSchema.virtual('senderId').get(function () { return this.sender; });
matchSchema.virtual('receiverId').get(function () { return this.receiver; });
matchSchema.virtual('user1').get(function () { return this.sender; });
matchSchema.virtual('user2').get(function () { return this.receiver; });
matchSchema.virtual('requestedSkill').get(function () { return this.skillRequested; });
matchSchema.virtual('offeredSkill').get(function () { return this.skillOffered; });

matchSchema.set('toJSON', { virtuals: true });
matchSchema.set('toObject', { virtuals: true });

// Prevent duplicate pending requests between the same two users
matchSchema.index(
  { sender: 1, receiver: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
