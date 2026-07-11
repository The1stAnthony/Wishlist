const jwt = require('jsonwebtoken');

/**
 * Express middleware that validates the JWT sent in the Authorization header.
 * Attaches `req.user = { id, name, email }` on success.
 * Returns 401 if the token is missing or invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Expect: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
