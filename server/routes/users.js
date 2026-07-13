const express     = require('express');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users/:handle ─────────────────────────────────────────────────
// Public profile for a creator. No auth required to view.

router.get('/:handle', async (req, res) => {
  try {
    const creator = await queryOne(
      `SELECT id, display_name, avatar_url, creator_mode, created_at,
              (SELECT COUNT(*) FROM follows WHERE followed_id = id)::int AS follower_count
       FROM users
       WHERE display_name = $1 AND creator_mode = TRUE`,
      [req.params.handle]
    );
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const wishlists = await query(
      `SELECT w.id, w.title, w.event_date, w.share_token,
              (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = w.id)::int AS item_count,
              (SELECT image_url FROM wishlist_items
               WHERE wishlist_id = w.id AND image_url IS NOT NULL
               ORDER BY priority ASC, created_at ASC LIMIT 1) AS cover_image
       FROM wishlists w
       WHERE w.user_id = $1 AND COALESCE(w.visibility, 'public') = 'public'
       ORDER BY w.created_at DESC`,
      [creator.id]
    );

    res.json({ creator, wishlists });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// ── GET /api/users/:handle/follow-status ──────────────────────────────────
// Check if the requesting user follows this creator (requires auth).

router.get('/:handle/follow-status', requireAuth, async (req, res) => {
  try {
    const creator = await queryOne(
      `SELECT id FROM users WHERE display_name = $1 AND creator_mode = TRUE`,
      [req.params.handle]
    );
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const follow = await queryOne(
      `SELECT id FROM follows WHERE follower_id = $1 AND followed_id = $2`,
      [req.user.id, creator.id]
    );
    res.json({ following: Boolean(follow) });
  } catch (err) {
    console.error('Follow status error:', err);
    res.status(500).json({ error: 'Could not check follow status' });
  }
});

module.exports = router;
