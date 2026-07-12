const express     = require('express');
const { v4: uuid } = require('uuid');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/wishlists/my ───────────────────────────────────────────────────

router.get('/my', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.*, COUNT(i.id)::int AS item_count
       FROM wishlists w
       LEFT JOIN wishlist_items i ON i.wishlist_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json({ wishlists });
  } catch (err) {
    console.error('Get wishlists error:', err);
    res.status(500).json({ error: 'Could not fetch wishlists' });
  }
});

// ── POST /api/wishlists ─────────────────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  const { title, description, event_date, is_public, share_address, use_real_name } = req.body;

  if (!title) return res.status(400).json({ error: 'A title is required' });

  const shareToken = uuid().replace(/-/g, '').slice(0, 16);

  try {
    const wishlist = await queryOne(
      `INSERT INTO wishlists
         (user_id, title, description, event_date, is_public, share_address, use_real_name, share_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        title,
        description    || null,
        event_date     || null,
        is_public     !== undefined ? Boolean(is_public)     : true,
        share_address !== undefined ? Boolean(share_address) : false,
        use_real_name !== undefined ? Boolean(use_real_name) : true,
        shareToken,
      ]
    );
    res.status(201).json({ wishlist });
  } catch (err) {
    console.error('Create wishlist error:', err);
    res.status(500).json({ error: 'Could not create wishlist' });
  }
});

// ── GET /api/wishlists/share/:token ─────────────────────────────────────────
// Public — no auth required

router.get('/share/:token', async (req, res) => {
  try {
    const wishlist = await queryOne(
      'SELECT * FROM wishlists WHERE share_token = $1 AND is_public = TRUE',
      [req.params.token]
    );
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found or is private' });

    // Resolve which name to show and whether to include the address
    const ownerRow = await queryOne(
      'SELECT id, name, display_name, street_address, city, state, zip_code, country FROM users WHERE id = $1',
      [wishlist.user_id]
    );

    const owner = {
      id:         ownerRow.id,
      shown_name: wishlist.use_real_name
                    ? ownerRow.name
                    : (ownerRow.display_name || ownerRow.name),
      ...(wishlist.share_address && {
        street_address: ownerRow.street_address,
        city:           ownerRow.city,
        state:          ownerRow.state,
        zip_code:       ownerRow.zip_code,
        country:        ownerRow.country,
      }),
    };

    const items = await query(
      `SELECT i.*, u.name AS purchased_by_name
       FROM wishlist_items i
       LEFT JOIN users u ON u.id = i.purchased_by
       WHERE i.wishlist_id = $1
       ORDER BY i.priority ASC, i.created_at ASC`,
      [wishlist.id]
    );

    res.json({ wishlist, owner, items });
  } catch (err) {
    console.error('Get shared list error:', err);
    res.status(500).json({ error: 'Could not fetch wishlist' });
  }
});

// ── GET /api/wishlists/:id ──────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const wishlist = await queryOne(
      'SELECT * FROM wishlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    const items = await query(
      `SELECT i.*, u.name AS purchased_by_name
       FROM wishlist_items i
       LEFT JOIN users u ON u.id = i.purchased_by
       WHERE i.wishlist_id = $1
       ORDER BY i.priority ASC, i.created_at ASC`,
      [wishlist.id]
    );

    res.json({ wishlist, items });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Could not fetch wishlist' });
  }
});

// ── PATCH /api/wishlists/:id ────────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req, res) => {
  const { title, description, event_date, is_public, share_address, use_real_name } = req.body;

  try {
    const existing = await queryOne(
      'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Wishlist not found' });

    const wishlist = await queryOne(
      `UPDATE wishlists
       SET title = $1, description = $2, event_date = $3,
           is_public = $4, share_address = $5, use_real_name = $6
       WHERE id = $7
       RETURNING *`,
      [
        title,
        description    || null,
        event_date     || null,
        Boolean(is_public),
        Boolean(share_address),
        use_real_name !== undefined ? Boolean(use_real_name) : true,
        req.params.id,
      ]
    );
    res.json({ wishlist });
  } catch (err) {
    console.error('Update wishlist error:', err);
    res.status(500).json({ error: 'Could not update wishlist' });
  }
});

// ── DELETE /api/wishlists/:id ───────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM wishlists WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.length) return res.status(404).json({ error: 'Wishlist not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete wishlist error:', err);
    res.status(500).json({ error: 'Could not delete wishlist' });
  }
});

// ── POST /api/wishlists/:id/items ───────────────────────────────────────────

router.post('/:id/items', requireAuth, async (req, res) => {
  const { name, description, price, url, affiliate_url, image_url, priority } = req.body;
  if (!name) return res.status(400).json({ error: 'Item name is required' });

  try {
    const wishlist = await queryOne(
      'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    const item = await queryOne(
      `INSERT INTO wishlist_items
         (wishlist_id, name, description, price, url, affiliate_url, image_url, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.params.id,
        name,
        description   || null,
        price         || null,
        url           || null,
        affiliate_url || null,
        image_url     || null,
        priority      || 2,
      ]
    );
    res.status(201).json({ item });
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ error: 'Could not add item' });
  }
});

// ── PATCH /api/wishlists/items/:itemId ─────────────────────────────────────

router.patch('/items/:itemId', requireAuth, async (req, res) => {
  const { name, description, price, url, affiliate_url, image_url, priority } = req.body;

  try {
    // Confirm ownership via join
    const owned = await queryOne(
      `SELECT i.id FROM wishlist_items i
       JOIN wishlists w ON w.id = i.wishlist_id
       WHERE i.id = $1 AND w.user_id = $2`,
      [req.params.itemId, req.user.id]
    );
    if (!owned) return res.status(404).json({ error: 'Item not found' });

    const item = await queryOne(
      `UPDATE wishlist_items
       SET name = $1, description = $2, price = $3, url = $4,
           affiliate_url = $5, image_url = $6, priority = $7
       WHERE id = $8
       RETURNING *`,
      [name, description || null, price || null, url || null,
       affiliate_url || null, image_url || null, priority || 2, req.params.itemId]
    );
    res.json({ item });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Could not update item' });
  }
});

// ── DELETE /api/wishlists/items/:itemId ─────────────────────────────────────

router.delete('/items/:itemId', requireAuth, async (req, res) => {
  try {
    const owned = await queryOne(
      `SELECT i.id FROM wishlist_items i
       JOIN wishlists w ON w.id = i.wishlist_id
       WHERE i.id = $1 AND w.user_id = $2`,
      [req.params.itemId, req.user.id]
    );
    if (!owned) return res.status(404).json({ error: 'Item not found' });

    await query('DELETE FROM wishlist_items WHERE id = $1', [req.params.itemId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Could not delete item' });
  }
});

// ── POST /api/wishlists/items/:itemId/purchase ──────────────────────────────

router.post('/items/:itemId/purchase', requireAuth, async (req, res) => {
  try {
    const item = await queryOne('SELECT * FROM wishlist_items WHERE id = $1', [req.params.itemId]);
    if (!item)           return res.status(404).json({ error: 'Item not found' });
    if (item.is_purchased) return res.status(409).json({ error: 'Item already purchased' });

    await query(
      'UPDATE wishlist_items SET is_purchased = TRUE, purchased_by = $1 WHERE id = $2',
      [req.user.id, req.params.itemId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Purchase item error:', err);
    res.status(500).json({ error: 'Could not mark item as purchased' });
  }
});

module.exports = router;
