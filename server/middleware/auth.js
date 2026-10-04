const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'ecosense_jwt_secure_key_2026_capstone_demo';

/**
 * Middleware: Verify JWT and attach authenticated user to request
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Malformed authorization header.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid or forged authentication token.'
      });
    }

    // Verify user exists and is active
    const userResult = await db.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    const user = userResult.rows[0];
    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        error: 'Account has been deactivated. Please contact an administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Verification error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.'
    });
  }
}

/**
 * Middleware: Role-Based Access Control gate for Admin-only routes
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.'
    });
  }

  next;
  next();
}

/**
 * Optional authentication: attaches user if token is provided and valid, otherwise proceeds as guest
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userResult = await db.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rowCount > 0 && userResult.rows[0].is_active !== false) {
          req.user = userResult.rows[0];
        }
      }
    }
  } catch (e) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

module.exports = {
  authenticateUser,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
};
