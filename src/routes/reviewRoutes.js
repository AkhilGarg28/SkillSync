const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getUserReviews } = require('../controllers/reviewController');

// POST /api/reviews (Protected)
router.post('/', protect, createReview);

// GET /api/reviews/user/:id (Public)
router.get('/user/:id', getUserReviews);

module.exports = router;
