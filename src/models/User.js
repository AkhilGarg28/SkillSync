const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: {
      type: String,
      required: true,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
    },
  },
  { _id: false }
);

const teachSkillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      required: true,
      trim: true,
    },
    proofLink: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const learnSkillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    desiredLevel: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    city: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC',
    },
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skillsToTeach: {
      type: [teachSkillSchema],
      default: [],
    },
    skillsToLearn: {
      type: [learnSkillSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual mapping weeklySlots to availability for compatibility
userSchema.virtual('weeklySlots').get(function () {
  return this.availability;
});
userSchema.virtual('weeklySlots').set(function (slots) {
  this.availability = slots;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
