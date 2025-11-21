const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

// Authentication middleware - can be disabled for testing
const AUTH_ENABLED = process.env.AUTH_ENABLED !== 'false'; // Default to enabled

exports.authenticate = async (req, res, next) => {
  // Skip authentication if disabled (for testing)
  if (!AUTH_ENABLED) {
    // For testing, use a default user ID or skip
    // You can set a default user ID in env for testing
    req.userId = process.env.TEST_USER_ID || null;
    return next();
  }

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Please provide a valid token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed'
    });
  }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          req.userId = decoded.userId;
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

