const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── Helper ──────────────────────────────────────────────────────────────────

/**
 * Creates a signed JWT containing the user's id, name, and email.
 * Tokens expire after 7 days so users stay logged in across sessions.
 */
function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/register ─────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { name, email, password, birthday } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Check if email is already registered
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  // Hash the password before storing — never store plaintext passwords
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = db
    .prepare('INSERT INTO users (name, email, password, birthday) VALUES (?, ?, ?, ?)')
    .run(name, email.toLowerCase().trim(), hashedPassword, birthday || null);

  const user = db.prepare('SELECT id, name, email, birthday FROM users WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({ user, token: createToken(user) });
});

// ── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db
    .prepare('SELECT id, name, email, birthday, password FROM users WHERE email = ?')
    .get(email.toLowerCase().trim());

  // Use a generic error message so we don't reveal whether the email exists
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Don't send the hashed password back to the client
  const { password: _pw, ...safeUser } = user;

  res.json({ user: safeUser, token: createToken(safeUser) });
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
// Returns the current user's profile — useful for restoring session on page load

router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, birthday, avatar_url, created_at FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

// ── PATCH /api/auth/profile ─────────────────────────────────────────────────

router.patch('/profile', requireAuth, (req, res) => {
  const { name, birthday } = req.body;

  db.prepare('UPDATE users SET name = ?, birthday = ? WHERE id = ?')
    .run(name, birthday || null, req.user.id);

  const updated = db
    .prepare('SELECT id, name, email, birthday, avatar_url FROM users WHERE id = ?')
    .get(req.user.id);

  res.json({ user: updated });
});

module.exports = router;
