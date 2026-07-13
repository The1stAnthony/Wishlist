const express     = require('express');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/birthdays ──────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const contacts = await query(
      'SELECT * FROM birthday_contacts WHERE user_id = $1 ORDER BY birthday ASC',
      [req.user.id]
    );
    res.json({ contacts });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Could not fetch contacts' });
  }
});

// ── GET /api/birthdays/upcoming ─────────────────────────────────────────────
// Returns contacts with birthdays in the next 60 days

router.get('/upcoming', requireAuth, async (req, res) => {
  try {
    const contacts = await query(
      'SELECT * FROM birthday_contacts WHERE user_id = $1',
      [req.user.id]
    );

    const today = new Date();

    const upcoming = contacts
      .map((contact) => {
        const [, month, day] = contact.birthday.split('-').map(Number);
        const next = new Date(today.getFullYear(), month - 1, day);
        if (next < today) next.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
        return { ...contact, days_until: daysUntil, next_birthday: next.toISOString().split('T')[0] };
      })
      .filter((c) => c.days_until <= 60)
      .sort((a, b) => a.days_until - b.days_until);

    res.json({ upcoming });
  } catch (err) {
    console.error('Get upcoming error:', err);
    res.status(500).json({ error: 'Could not fetch upcoming birthdays' });
  }
});

// ── POST /api/birthdays ─────────────────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  const { contact_name, contact_email, birthday, notes, wishlist_url } = req.body;

  if (!contact_name || !birthday) {
    return res.status(400).json({ error: 'Name and birthday are required' });
  }

  try {
    const contact = await queryOne(
      `INSERT INTO birthday_contacts (user_id, contact_name, contact_email, birthday, notes, wishlist_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, contact_name, contact_email || null, birthday, notes || null, wishlist_url || null]
    );
    res.status(201).json({ contact });
  } catch (err) {
    console.error('Add contact error:', err);
    res.status(500).json({ error: 'Could not add contact' });
  }
});

// ── PATCH /api/birthdays/:id ────────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req, res) => {
  const { contact_name, contact_email, birthday, notes, wishlist_url } = req.body;

  try {
    const existing = await queryOne(
      'SELECT id FROM birthday_contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const contact = await queryOne(
      `UPDATE birthday_contacts
       SET contact_name = $1, contact_email = $2, birthday = $3, notes = $4, wishlist_url = $5
       WHERE id = $6
       RETURNING *`,
      [contact_name, contact_email || null, birthday, notes || null, wishlist_url || null, req.params.id]
    );
    res.json({ contact });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ error: 'Could not update contact' });
  }
});

// ── DELETE /api/birthdays/:id ───────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM birthday_contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.length) return res.status(404).json({ error: 'Contact not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: 'Could not delete contact' });
  }
});

module.exports = router;
