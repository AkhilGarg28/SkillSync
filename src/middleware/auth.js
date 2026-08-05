const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync_secret_key';

const protect = (req, res, next) => {
  let token;

  if (req.headers['x-user-id']) {
    req.user = { id: req.headers['x-user-id'] };
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Missing authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.userId || decoded._id || decoded.sub,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Invalid or expired token.',
    });
  }
};

module.exports = { protect, JWT_SECRET };
