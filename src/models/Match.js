const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'rejected', 'completed'],
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

matchSchema.pre('save', function (next) {
  if (this.user1 && !this.user1Id) this.user1Id = this.user1;
  if (this.user1Id && !this.user1) this.user1 = this.user1Id;
  if (this.user2 && !this.user2Id) this.user2Id = this.user2;
  if (this.user2Id && !this.user2) this.user2 = this.user2Id;
  next();
});

matchSchema.index({ user1Id: 1, user2Id: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
