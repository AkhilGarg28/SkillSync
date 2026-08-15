const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync_secret_key';

const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers['x-user-id']) {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const adminRole = req.headers['x-admin-role'] || 'super_admin';
    if (userRole) {
      req.user = { id: userId, role: userRole, adminRole };
      return next();
    }
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId).select('name email role adminRole isBlocked isVerified');
        if (user && user.isBlocked) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden: Your account has been suspended/blocked.',
          });
        }
        req.user = {
          id: userId,
          name: user ? user.name : 'User',
          email: user ? user.email : '',
          role: user ? user.role : 'user',
          adminRole: user ? (user.adminRole || 'super_admin') : 'super_admin',
          isVerified: user ? user.isVerified : false,
        };
        return next();
      } catch (err) {
        req.user = { id: userId, role: 'user', adminRole: 'super_admin' };
        return next();
      }
    }
    req.user = { id: userId, role: 'user', adminRole: 'super_admin' };
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && (req.body?.user1Id || req.body?.userId)) {
    const userId = req.body.user1Id || req.body.userId;
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId).select('name email role adminRole isBlocked isVerified');
        if (user && user.isBlocked) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden: Your account has been suspended/blocked.',
          });
        }
        req.user = {
          id: userId,
          name: user ? user.name : 'User',
          email: user ? user.email : '',
          role: user ? user.role : 'user',
          adminRole: user ? (user.adminRole || 'super_admin') : 'super_admin',
          isVerified: user ? user.isVerified : false,
        };
        return next();
      } catch (err) {
        req.user = { id: userId, role: 'user', adminRole: 'super_admin' };
        return next();
      }
    }
    req.user = { id: userId, role: 'user', adminRole: 'super_admin' };
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
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('name email role adminRole isBlocked isVerified');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized: User account no longer exists.',
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Your account has been suspended/blocked.',
        });
      }

      req.user = {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || decoded.role || 'user',
        adminRole: user.adminRole || decoded.adminRole || 'super_admin',
        isVerified: user.isVerified || false,
      };
    } else {
      req.user = {
        id: userId,
        role: decoded.role || 'user',
        adminRole: decoded.adminRole || 'super_admin',
        isVerified: false,
      };
    }
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

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && (req.user.adminRole === 'super_admin' || !req.user.adminRole)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Super Admin privileges required.',
  });
};

module.exports = { protect, admin, requireSuperAdmin, JWT_SECRET };
