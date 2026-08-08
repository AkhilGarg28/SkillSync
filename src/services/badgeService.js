const Session = require('../models/Session');
const Review = require('../models/Review');

/**
 * Dynamically computes and returns the list of badges earned by a user.
 * 
 * Badge Rules:
 * 1. Verified Teacher: Completed at least 3 sessions.
 * 2. Peer Rated: Received at least 1 review, with average rating >= 4.0 and at least one rating >= 4.
 * 
 * @param {string} userId - User ID to compute badges for
 * @returns {Promise<Array<Object>>} List of earned badges
 */
const calculateUserBadges = async (userId) => {
  const badges = [];

  // 1. Check Verified Teacher criteria
  const completedSessionsCount = await Session.countDocuments({
    status: 'completed',
    $or: [{ user1Id: userId }, { user2Id: userId }],
  });

  if (completedSessionsCount >= 3) {
    badges.push({
      name: 'Verified Teacher',
      description: 'Awarded automatically after completing 3 or more sessions.',
    });
  }

  // 2. Check Peer Rated criteria
  const reviews = await Review.find({ revieweeId: userId });
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    const hasPositive = reviews.some((r) => r.rating >= 4);

    if (avgRating >= 4.0 && hasPositive) {
      badges.push({
        name: 'Peer Rated',
        description: 'Awarded automatically for maintaining a positive peer rating of 4.0 or higher.',
        averageRating: avgRating,
      });
    }
  }

  return badges;
};

module.exports = {
  calculateUserBadges,
};
