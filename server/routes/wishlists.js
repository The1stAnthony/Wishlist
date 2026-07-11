const express     = require('express');
const { v4: uuid } = require('uuid');
const db          = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/wishlists/my ───────────────────────────────────────────────────
// Returns all wishlists belonging to the logged-in user

router.get('/my', requireAuth, (req, res) => {
  const wishlists = db
    .prepare(`
      SELECT w.*, COUNT(i.id) AS item_count
      FROM wishlists w
      LEFT JOIN wishlist_items i ON i.wishlist_id = w.id
      WHERE w.user_id = ?
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `)
    .all(req.user.id);

  res.json({ wishlists });
});

// ── POST /api/wishlists ─────────────────────────────────────────────────────
// Create a new wishlist

router.post('/', requireAuth, (req, res) => {
  const { title, description, event_date, is_public } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'A title is required' });
  }

  // Generate a short random token for the shareable public link
  const shareToken = uuid().replace(/-/g, '').slice(0, 16);

  const result = db
    .prepare(`
      INSERT INTO wishlists (user_id, title, description, event_date, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      req.user.id,
      title,
      description || null,
      event_date  || null,
      is_public !== undefined ? (is_public ? 1 : 0) : 1,
      shareToken
    );

  const wishlist = db
    .prepare('SELECT * FROM wishlists WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ wishlist });
});

// ── GET /api/wishlists/share/:token ────────────────────────────────────────
// Public route — lets anyone with the link view a wishlist

router.get('/share/:token', (req, res) => {
  const wishlist = db
    .prepare('SELECT * FROM wishlists WHERE share_token = ? AND is_public = 1')
    .get(req.params.token);

  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found or is private' });
  }

  const owner = db
    .prepare('SELECT id, name FROM users WHERE id = ?')
    .get(wishlist.user_id);

  const items = db
    .prepare(`
      SELECT i.*, u.name AS purchased_by_name
      FROM wishlist_items i
      LEFT JOIN users u ON u.id = i.purchased_by
      WHERE i.wishlist_id = ?
      ORDER BY i.priority ASC, i.created_at ASC
    `)
    .all(wishlist.id);

  res.json({ wishlist, owner, items });
});

// ── GET /api/wishlists/:id ──────────────────────────────────────────────────
// Get a single wishlist with its items (owner only)

router.get('/:id', requireAuth, (req, res) => {
  const wishlist = db
    .prepare('SELECT * FROM wishlists WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }

  const items = db
    .prepare(`
      SELECT i.*, u.name AS purchased_by_name
      FROM wishlist_items i
      LEFT JOIN users u ON u.id = i.purchased_by
      WHERE i.wishlist_id = ?
      ORDER BY i.priority ASC, i.created_at ASC
    `)
    .all(wishlist.id);

  res.json({ wishlist, items });
});

// ── PATCH /api/wishlists/:id ────────────────────────────────────────────────

router.patch('/:id', requireAuth, (req, res) => {
  const { title, description, event_date, is_public } = req.body;

  const wishlist = db
    .prepare('SELECT id FROM wishlists WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }

  db.prepare(`
    UPDATE wishlists
    SET title = ?, description = ?, event_date = ?, is_public = ?
    WHERE id = ?
  `).run(title, description || null, event_date || null, is_public ? 1 : 0, req.params.id);

  const updated = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(req.params.id);
  res.json({ wishlist: updated });
});

// ── DELETE /api/wishlists/:id ───────────────────────────────────────────────

router.delete('/:id', requireAuth, (req, res) => {
  const result = db
    .prepare('DELETE FROM wishlists WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }

  res.json({ success: true });
});

// ── POST /api/wishlists/:id/items ───────────────────────────────────────────
// Add an item to a wishlist

router.post('/:id/items', requireAuth, (req, res) => {
  const { name, description, price, url, affiliate_url, image_url, priority } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  // Confirm the wishlist belongs to this user
  const wishlist = db
    .prepare('SELECT id FROM wishlists WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }

  const result = db
    .prepare(`
      INSERT INTO wishlist_items
        (wishlist_id, name, description, price, url, affiliate_url, image_url, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      req.params.id,
      name,
      description   || null,
      price         || null,
      url           || null,
      affiliate_url || null,
      image_url     || null,
      priority      || 2
    );

  const item = db
    .prepare('SELECT * FROM wishlist_items WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ item });
});

// ── PATCH /api/wishlists/items/:itemId ─────────────────────────────────────

router.patch('/items/:itemId', requireAuth, (req, res) => {
  const { name, description, price, url, affiliate_url, image_url, priority } = req.body;

  // Confirm ownership via JOIN
  const item = db
    .prepare(`
      SELECT i.id FROM wishlist_items i
      JOIN wishlists w ON w.id = i.wishlist_id
      WHERE i.id = ? AND w.user_id = ?
    `)
    .get(req.params.itemId, req.user.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.prepare(`
    UPDATE wishlist_items
    SET name = ?, description = ?, price = ?, url = ?, affiliate_url = ?, image_url = ?, priority = ?
    WHERE id = ?
  `).run(name, description || null, price || null, url || null, affiliate_url || null, image_url || null, priority || 2, req.params.itemId);

  const updated = db.prepare('SELECT * FROM wishlist_items WHERE id = ?').get(req.params.itemId);
  res.json({ item: updated });
});

// ── DELETE /api/wishlists/items/:itemId ─────────────────────────────────────

router.delete('/items/:itemId', requireAuth, (req, res) => {
  const item = db
    .prepare(`
      SELECT i.id FROM wishlist_items i
      JOIN wishlists w ON w.id = i.wishlist_id
      WHERE i.id = ? AND w.user_id = ?
    `)
    .get(req.params.itemId, req.user.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(req.params.itemId);
  res.json({ success: true });
});

// ── POST /api/wishlists/items/:itemId/purchase ──────────────────────────────
// Lets a gifter mark an item as purchased so no one else buys the same thing

router.post('/items/:itemId/purchase', requireAuth, (req, res) => {
  const item = db
    .prepare('SELECT * FROM wishlist_items WHERE id = ?')
    .get(req.params.itemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.is_purchased) {
    return res.status(409).json({ error: 'This item has already been marked as purchased' });
  }

  db.prepare('UPDATE wishlist_items SET is_purchased = 1, purchased_by = ? WHERE id = ?')
    .run(req.user.id, req.params.itemId);

  res.json({ success: true });
});

module.exports = router;
