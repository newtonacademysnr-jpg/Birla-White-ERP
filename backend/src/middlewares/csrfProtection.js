/**
 * Anti-CSRF protection middleware
 * Enforces custom header validation on all state-changing HTTP requests (POST, PUT, PATCH, DELETE).
 * Modern browsers enforce that external cross-origin HTML forms cannot set custom headers.
 */
module.exports = function csrfProtection(req, res, next) {
  // Idempotent / Safe methods do not require CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt auth login/logout routes from custom header check if needed, or enforce everywhere
  const customHeader = req.headers['x-requested-with'] || req.headers['x-csrf-token'];
  
  if (!customHeader) {
    return res.status(403).json({
      error: 'CSRF Rejected',
      message: 'Missing required anti-CSRF request header (X-Requested-With or X-CSRF-Token).'
    });
  }

  next();
};
