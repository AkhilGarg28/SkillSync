const express = require('express');
const router = express.Router();
const SkillCategory = require('../models/SkillCategory');

// Public route to list skill categories
router.get('/', async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
