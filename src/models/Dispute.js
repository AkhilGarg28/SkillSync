const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    initiatorComment: {
      type: String,
      trim: true,
      default: '',
    },
    respondentComment: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    outcome: {
      type: String,
      enum: ['none', 'no_action', 'warn_initiator', 'warn_respondent', 'warn_both', 'void_session'],
      default: 'none',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.index({ sessionId: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);
