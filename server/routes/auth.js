const express     = require('express');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const db          = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── Helper ──────────────────────────────────────────────────────────────────

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Columns we're safe to return to the client (never password, never raw address unless requested)
const PUBLIC_FIELDS = `
  id, name, display_name, email, birthday, avatar_url, created_at
`;

// Address fields included only for the account owner's own profile fetch
const OWNER_FIELDS = `
  id, name, display_name, email, birthday, avatar_url, created_at,
  street_address, city, state, zip_code, country
`;

// ── POST /api/auth/register ─────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { name, display_name, email, password, birthday } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = db
    .prepare(`
      INSERT INTO users (name, display_name, email, password, birthday)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      name,
      display_name?.trim() || null,
      email.toLowerCase().trim(),
      hashedPassword,
      birthday || null
    );

  const user = db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`).get(result.lastInsertRowid);

  res.status(201).json({ user, token: createToken(user) });
});

// ── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db
    .prepare(`SELECT ${PUBLIC_FIELDS}, password FROM users WHERE email = ?`)
    .get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _pw, ...safeUser } = user;
  res.json({ user: safeUser, token: createToken(safeUser) });
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────

router.get('/me', requireAuth, (req, res) => {
  // Return address fields for the account owner's own session restore
  const user = db.prepare(`SELECT ${OWNER_FIELDS} FROM users WHERE id = ?`).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

// ── PATCH /api/auth/profile ─────────────────────────────────────────────────
// Handles both basic info and private address in one call

router.patch('/profile', requireAuth, (req, res) => {
  const {
    name, display_name, birthday,
    street_address, city, state, zip_code, country,
  } = req.body;

  db.prepare(`
    UPDATE users
    SET name           = ?,
        display_name   = ?,
        birthday       = ?,
        street_address = ?,
        city           = ?,
        state          = ?,
        zip_code       = ?,
        country        = ?
    WHERE id = ?
  `).run(
    name,
    display_name?.trim() || null,
    birthday       || null,
    street_address || null,
    city           || null,
    state          || null,
    zip_code       || null,
    country        || 'US',
    req.user.id
  );

  const updated = db.prepare(`SELECT ${OWNER_FIELDS} FROM users WHERE id = ?`).get(req.user.id);
  res.json({ user: updated });
});

module.exports = router;
