const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'maintenance'],
      default: 'info',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
