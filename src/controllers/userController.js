const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // Authorization boundary check
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this profile.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    const { name, email, city, timezone, availability, profilePhoto, bio } = req.body;

    // Validate name and email if provided
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name cannot be empty.',
      });
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Email cannot be empty.',
        });
      }
      // Check for duplicate email
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use.',
        });
      }
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (city !== undefined) user.city = city;
    if (timezone !== undefined) user.timezone = timezone;
    if (availability !== undefined) user.availability = availability;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const returnedUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete returnedUser.password;
    res.status(200).json({
      success: true,
      data: returnedUser,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add or update a skill to teach
// @route   POST /api/users/:id/skills-teach
// @access  Private
exports.addTeachSkill = async (req, res) => {
  try {
    // Authorization boundary check
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this profile.',
      });
    }

    const { skillName, experienceLevel, proofLink } = req.body;

    if (!skillName || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'skillName and experienceLevel are required fields.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Check if skill already exists
    const existingIndex = user.skillsToTeach.findIndex(
      (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (existingIndex > -1) {
      user.skillsToTeach[existingIndex] = { skillName, experienceLevel, proofLink };
    } else {
      user.skillsToTeach.push({ skillName, experienceLevel, proofLink });
    }

    await user.save();

    const returnedUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete returnedUser.password;
    res.status(200).json({
      success: true,
      data: returnedUser,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add or update a skill to learn
// @route   POST /api/users/:id/skills-learn
// @access  Private
exports.addLearnSkill = async (req, res) => {
  try {
    // Authorization boundary check
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this profile.',
      });
    }

    const { skillName, desiredLevel } = req.body;

    if (!skillName || !desiredLevel) {
      return res.status(400).json({
        success: false,
        error: 'skillName and desiredLevel are required fields.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Check if skill already exists
    const existingIndex = user.skillsToLearn.findIndex(
      (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (existingIndex > -1) {
      user.skillsToLearn[existingIndex] = { skillName, desiredLevel };
    } else {
      user.skillsToLearn.push({ skillName, desiredLevel });
    }

    await user.save();

    const returnedUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete returnedUser.password;
    res.status(200).json({
      success: true,
      data: returnedUser,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
