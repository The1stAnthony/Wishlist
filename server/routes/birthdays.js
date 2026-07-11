const express     = require('express');
const db          = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/birthdays ──────────────────────────────────────────────────────
// Get all birthday contacts for the logged-in user, sorted by next upcoming birthday

router.get('/', requireAuth, (req, res) => {
  const contacts = db
    .prepare('SELECT * FROM birthday_contacts WHERE user_id = ? ORDER BY birthday ASC')
    .all(req.user.id);

  res.json({ contacts });
});

// ── GET /api/birthdays/upcoming ─────────────────────────────────────────────
// Returns contacts with birthdays in the next 60 days

router.get('/upcoming', requireAuth, (req, res) => {
  const contacts = db
    .prepare('SELECT * FROM birthday_contacts WHERE user_id = ?')
    .all(req.user.id);

  const today = new Date();
  const upcoming = contacts
    .map((contact) => {
      // Calculate days until next birthday, ignoring year
      const [, month, day] = contact.birthday.split('-').map(Number);
      const next = new Date(today.getFullYear(), month - 1, day);

      // If the birthday already passed this year, use next year
      if (next < today) {
        next.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
      return { ...contact, days_until: daysUntil, next_birthday: next.toISOString().split('T')[0] };
    })
    .filter((c) => c.days_until <= 60)
    .sort((a, b) => a.days_until - b.days_until);

  res.json({ upcoming });
});

// ── POST /api/birthdays ─────────────────────────────────────────────────────

router.post('/', requireAuth, (req, res) => {
  const { contact_name, contact_email, birthday, notes, wishlist_url } = req.body;

  if (!contact_name || !birthday) {
    return res.status(400).json({ error: 'Name and birthday are required' });
  }

  const result = db
    .prepare(`
      INSERT INTO birthday_contacts (user_id, contact_name, contact_email, birthday, notes, wishlist_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      req.user.id,
      contact_name,
      contact_email || null,
      birthday,
      notes         || null,
      wishlist_url  || null
    );

  const contact = db
    .prepare('SELECT * FROM birthday_contacts WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ contact });
});

// ── PATCH /api/birthdays/:id ────────────────────────────────────────────────

router.patch('/:id', requireAuth, (req, res) => {
  const { contact_name, contact_email, birthday, notes, wishlist_url } = req.body;

  const existing = db
    .prepare('SELECT id FROM birthday_contacts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  db.prepare(`
    UPDATE birthday_contacts
    SET contact_name = ?, contact_email = ?, birthday = ?, notes = ?, wishlist_url = ?
    WHERE id = ?
  `).run(contact_name, contact_email || null, birthday, notes || null, wishlist_url || null, req.params.id);

  const updated = db
    .prepare('SELECT * FROM birthday_contacts WHERE id = ?')
    .get(req.params.id);

  res.json({ contact: updated });
});

// ── DELETE /api/birthdays/:id ───────────────────────────────────────────────

router.delete('/:id', requireAuth, (req, res) => {
  const result = db
    .prepare('DELETE FROM birthday_contacts WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  res.json({ success: true });
});

module.exports = router;
