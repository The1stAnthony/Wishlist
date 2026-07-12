const express     = require('express');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Columns safe to return to the client — never includes password
const PUBLIC_FIELDS = 'id, name, display_name, email, birthday, avatar_url, creator_mode, created_at';

// Owner's profile fetch also includes the private address fields
const OWNER_FIELDS  = `${PUBLIC_FIELDS}, street_address, city, state, zip_code, country`;

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/register ─────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { name, display_name, email, password, birthday,
          street_address, city, state, zip_code, country } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const inserted = await queryOne(
      `INSERT INTO users (name, display_name, email, password, birthday,
                          street_address, city, state, zip_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [name, display_name?.trim() || null, email.toLowerCase().trim(), hashedPassword, birthday || null,
       street_address || null, city || null, state || null, zip_code || null, country || 'US']
    );

    const user = await queryOne(`SELECT ${OWNER_FIELDS} FROM users WHERE id = $1`, [inserted.id]);

    res.status(201).json({ user, token: createToken(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await queryOne(
      `SELECT ${PUBLIC_FIELDS}, password FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    // Generic error — don't reveal whether the email exists
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser, token: createToken(safeUser) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne(`SELECT ${OWNER_FIELDS} FROM users WHERE id = $1`, [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// ── PATCH /api/auth/profile ─────────────────────────────────────────────────

router.patch('/profile', requireAuth, async (req, res) => {
  const { name, display_name, birthday, avatar_url,
          street_address, city, state, zip_code, country } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    await query(
      `UPDATE users
       SET name = $1, display_name = $2, birthday = $3, avatar_url = $4,
           street_address = $5, city = $6, state = $7, zip_code = $8, country = $9
       WHERE id = $10`,
      [
        name.trim(),
        display_name?.trim() || null,
        birthday       || null,
        avatar_url     || null,
        street_address || null,
        city           || null,
        state          || null,
        zip_code       || null,
        country        || 'US',
        req.user.id,
      ]
    );

    const updated = await queryOne(`SELECT ${OWNER_FIELDS} FROM users WHERE id = $1`, [req.user.id]);
    res.json({ user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
});

// ── PATCH /api/auth/password ────────────────────────────────────────────────

router.patch('/password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    const row = await queryOne('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!row || !(await bcrypt.compare(current_password, row.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Could not update password' });
  }
});

// ── DELETE /api/auth/account ────────────────────────────────────────────────
// Requires user to type the exact confirmation phrase to prevent accidents.

router.delete('/account', requireAuth, async (req, res) => {
  const { phrase } = req.body;

  if (phrase !== 'Permanently Delete My Account') {
    return res.status(400).json({ error: 'Please type the exact confirmation phrase' });
  }

  try {
    // Cascade deletes wishlists + items if DB has ON DELETE CASCADE.
    // If not, delete in order to avoid FK violations.
    await query(
      `DELETE FROM wishlist_items
       WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = $1)`,
      [req.user.id]
    );
    await query('DELETE FROM wishlists WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM birthday_contacts WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Could not delete account' });
  }
});

// ── PATCH /api/auth/creator-mode — kept here for auth namespace consistency ──
// Actual logic lives in follows.js /toggle-creator — this is a convenience alias.

module.exports = router;
