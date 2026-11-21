const jwt = require('jsonwebtoken');

/**
 * Authentication verification middleware
 * Validates JWT from HttpOnly Cookie or Bearer Authorization header
 */
function requireAuth(req, res, next) {
  // Support both HttpOnly cookie and Bearer header (for API clients)
  const cookieToken = req.cookies && req.cookies.bw_token;
  const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied: Valid authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_emergency_only');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or forged authentication token.'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * @param {Array<string>} allowedRoles
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (req.user.role === 'ADMIN') {
      return next(); // Administrators have global access
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions for this operation.'
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
