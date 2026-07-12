const jwt = require('jsonwebtoken');

/**
 * Like requireAuth, but doesn't block unauthenticated requests.
 * Attaches req.user if a valid token is present, otherwise leaves it undefined.
 * Used for routes that are public but benefit from knowing who the caller is.
 */
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
}

module.exports = optionalAuth;
