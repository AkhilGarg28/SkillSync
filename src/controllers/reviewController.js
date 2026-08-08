const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a review for a user
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment } = req.body;
    const reviewerId = req.user ? req.user.id : req.body.reviewerId;

    if (!revieweeId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Please provide revieweeId and rating (1-5).',
      });
    }

    if (reviewerId && reviewerId.toString() === revieweeId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot review yourself.',
      });
    }

    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({
        success: false,
        error: 'User to review not found.',
      });
    }

    const review = new Review({
      reviewerId,
      revieweeId,
      rating: Number(rating),
      comment: comment || '',
    });

    const savedReview = await review.save();
    res.status(201).json({ success: true, data: savedReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/users/:id/reviews
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const revieweeId = req.params.id;
    const reviews = await Review.find({ revieweeId })
      .populate('reviewerId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: Number(avgRating),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
