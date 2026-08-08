const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

const uploadDir = path.join(__dirname, '../../uploads/verification');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// @desc    Submit identity/teacher verification document
// @route   POST /api/verification/identity
// @access  Private
exports.submitIdentityVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a verification document file.' });
    }

    const docUrl = `/uploads/verification/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        verificationDocument: docUrl,
        verificationStatus: 'pending',
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Teacher identity verification document submitted successfully.',
      data: {
        verificationStatus: user.verificationStatus,
        verificationDocument: user.verificationDocument,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit skill proof document for a teach skill
// @route   POST /api/verification/skill-proof
// @access  Private
exports.submitSkillProof = async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName) {
      return res.status(400).json({ success: false, error: 'skillName is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a skill proof document file.' });
    }

    const proofUrl = `/uploads/verification/${req.file.filename}`;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const skillIndex = user.skillsToTeach.findIndex(
      (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (skillIndex === -1) {
      return res.status(404).json({ success: false, error: 'Teach skill not found on profile.' });
    }

    user.skillsToTeach[skillIndex].proofLink = proofUrl;
    user.skillsToTeach[skillIndex].proofStatus = 'pending';

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill proof document submitted successfully.',
      data: user.skillsToTeach[skillIndex],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadMiddleware = upload;
