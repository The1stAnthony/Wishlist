const express     = require('express');
const { v4: uuid } = require('uuid');
const { query, queryOne } = require('../../lib/db');
const requireAuth  = require('../middleware/auth');

const router = express.Router();

// ── GET /api/wishlists/my ───────────────────────────────────────────────────

router.get('/my', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.*,
              COUNT(i.id)::int AS item_count,
              MAX(i.created_at) AS last_item_at
       FROM wishlists w
       LEFT JOIN wishlist_items i ON i.wishlist_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY COALESCE(MAX(i.created_at), w.created_at) DESC`,
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
  const { title, description, event_date, is_public, share_address, use_real_name, visibility } = req.body;

  if (!title) return res.status(400).json({ error: 'A title is required' });

  const shareToken = uuid().replace(/-/g, '').slice(0, 16);
  const effectiveVisibility = visibility || 'public';
  const effectiveIsPublic   = effectiveVisibility === 'public';

  try {
    const wishlist = await queryOne(
      `INSERT INTO wishlists
         (user_id, title, description, event_date, is_public, share_address, use_real_name, spoiler_free, visibility, share_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.id,
        title,
        description    || null,
        event_date     || null,
        effectiveIsPublic,
        share_address !== undefined ? Boolean(share_address) : false,
        use_real_name !== undefined ? Boolean(use_real_name) : true,
        true, // No Spoilers mode on by default
        effectiveVisibility,
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
      'SELECT id, name, display_name, street_address, city, state, zip_code, country, avatar_url FROM users WHERE id = $1',
      [wishlist.user_id]
    );

    const owner = {
      id:         ownerRow.id,
      shown_name: wishlist.use_real_name
                    ? ownerRow.name
                    : (ownerRow.display_name || ownerRow.name),
      country:    ownerRow.country || 'US',  // used for regional Amazon links
      ...(wishlist.share_address && {
        street_address: ownerRow.street_address,
        city:           ownerRow.city,
        state:          ownerRow.state,
        zip_code:       ownerRow.zip_code,
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

    // Two owner-view modes — gifters (SharedList) always see real data.
    //
    // SURPRISE MODE (spoiler_free = true):
    //   Full list returned, all purchase data stripped. Owner is completely in the dark.
    //
    // SHOPPING MODE (spoiler_free = false):
    //   Only items that haven't been FULLY purchased are returned, so the owner
    //   can see what they still need to buy for themselves. purchased_count is kept
    //   so they know "2 of 3 still needed," but purchased_by is hidden so they
    //   never learn which friend already bought one.
    const safeItems = wishlist.spoiler_free
      ? items.map(({ is_purchased, purchased_count, purchased_by, purchased_by_name, ...rest }) => ({
          ...rest,
          is_purchased:      false,
          purchased_count:   0,
          purchased_by:      null,
          purchased_by_name: null,
        }))
      : items
          .filter((i) => (i.purchased_count || 0) < (i.quantity || 1))
          .map(({ purchased_by, purchased_by_name, ...rest }) => ({
            ...rest,
            purchased_by:      null,
            purchased_by_name: null,
          }));

    res.json({ wishlist, items: safeItems });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Could not fetch wishlist' });
  }
});

// ── PATCH /api/wishlists/:id ────────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req, res) => {
  const { title, description, event_date, is_public, share_address, use_real_name, spoiler_free, visibility } = req.body;

  const effectiveVisibility = visibility || (is_public === false ? 'friends' : 'public');
  const effectiveIsPublic   = effectiveVisibility === 'public';

  try {
    const existing = await queryOne(
      'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Wishlist not found' });

    const wishlist = await queryOne(
      `UPDATE wishlists
       SET title = $1, description = $2, event_date = $3,
           is_public = $4, share_address = $5, use_real_name = $6, spoiler_free = $7, visibility = $8
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description    || null,
        event_date     || null,
        effectiveIsPublic,
        Boolean(share_address),
        use_real_name !== undefined ? Boolean(use_real_name) : true,
        spoiler_free  !== undefined ? Boolean(spoiler_free)  : false,
        effectiveVisibility,
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
  const { name, description, price, url, affiliate_url, image_url, priority, quantity } = req.body;
  if (!name) return res.status(400).json({ error: 'Item name is required' });

  try {
    const wishlist = await queryOne(
      'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    const item = await queryOne(
      `INSERT INTO wishlist_items
         (wishlist_id, name, description, price, url, affiliate_url, image_url, priority, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        Math.max(1, parseInt(quantity) || 1),
      ]
    );

    // Auto-link: if the same URL exists in another wishlist owned by this user,
    // assign them the same item_group_id so purchases sync across lists.
    if (url) {
      const sibling = await queryOne(
        `SELECT i.id, i.item_group_id
         FROM wishlist_items i
         JOIN wishlists w ON w.id = i.wishlist_id
         WHERE w.user_id = $1 AND i.url = $2 AND i.id != $3
         LIMIT 1`,
        [req.user.id, url, item.id]
      );
      if (sibling) {
        const groupId = sibling.item_group_id || uuid().replace(/-/g, '');
        if (!sibling.item_group_id) {
          // Seed group id onto the sibling (and any other same-URL items)
          await query(
            `UPDATE wishlist_items SET item_group_id = $1
             WHERE url = $2
               AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = $3)`,
            [groupId, url, req.user.id]
          );
        }
        await query(
          'UPDATE wishlist_items SET item_group_id = $1 WHERE id = $2',
          [groupId, item.id]
        );
        item.item_group_id = groupId;
      }
    }

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
// Requires a logged-in account to mark items purchased.
// This prevents anonymous abuse (marking everything bought to ruin someone's list).

router.post('/items/:itemId/purchase', requireAuth, async (req, res) => {
  const qty = Math.max(1, parseInt(req.body?.qty) || 1);

  try {
    const item = await queryOne(
      `SELECT i.*, w.is_public FROM wishlist_items i
       JOIN wishlists w ON w.id = i.wishlist_id
       WHERE i.id = $1`,
      [req.params.itemId]
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const remaining = (item.quantity || 1) - (item.purchased_count || 0);
    if (remaining <= 0) return res.status(409).json({ error: 'This item is already fully purchased' });

    const newCount = Math.min((item.purchased_count || 0) + qty, item.quantity || 1);
    const fullyPurchased = newCount >= (item.quantity || 1);

    const updated = await queryOne(
      `UPDATE wishlist_items
       SET purchased_count = $1,
           is_purchased    = $2,
           purchased_by    = COALESCE(purchased_by, $3)
       WHERE id = $4
       RETURNING *`,
      [newCount, fullyPurchased, req.user.id, req.params.itemId]
    );

    // Cross-wishlist sync: propagate purchase state to all linked items
    if (item.item_group_id) {
      await query(
        `UPDATE wishlist_items
         SET purchased_count = LEAST(quantity, $1),
             is_purchased    = LEAST(quantity, $1) >= quantity,
             purchased_by    = COALESCE(purchased_by, $2)
         WHERE item_group_id = $3 AND id != $4`,
        [newCount, req.user.id, item.item_group_id, req.params.itemId]
      );
    }

    res.json({ success: true, item: updated });
  } catch (err) {
    console.error('Purchase item error:', err);
    res.status(500).json({ error: 'Could not mark item as purchased' });
  }
});

module.exports = router;
