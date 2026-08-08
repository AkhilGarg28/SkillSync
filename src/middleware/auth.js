const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync_secret_key';

const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers['x-user-id']) {
    req.user = { id: req.headers['x-user-id'], role: 'user' };
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && (req.body?.user1Id || req.body?.userId)) {
    req.user = { id: req.body.user1Id || req.body.userId, role: 'user' };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Missing authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
    
    // Check if user is blocked or has admin role
    const user = await User.findById(userId).select('role isBlocked isVerified');
    if (user && user.isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Your account has been suspended/blocked.',
      });
    }

    req.user = {
      id: userId,
      role: user ? user.role : 'user',
      isVerified: user ? user.isVerified : false,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Invalid or expired token.',
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Admin access required.',
  });
};

module.exports = { protect, admin, JWT_SECRET };
