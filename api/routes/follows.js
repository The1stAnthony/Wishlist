const express     = require('express');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const PLATFORM_HANDLE = process.env.PLATFORM_CREATOR_HANDLE || 'The_1st_Anthony';

// ── GET /api/follows/followers ──────────────────────────────────────────────
// Returns people who follow me. Only surfaces creator accounts (privacy rule:
// regular users' real names must never be exposed to a creator's follower list).

router.get('/followers', requireAuth, async (req, res) => {
  try {
    const [followers, countRow] = await Promise.all([
      query(
        `SELECT u.id, u.display_name, u.avatar_url,
                EXISTS(
                  SELECT 1 FROM follows
                  WHERE follower_id = $1 AND followed_id = u.id
                ) AS i_follow_them
         FROM follows f
         JOIN users u ON u.id = f.follower_id
         WHERE f.followed_id = $1 AND u.creator_mode = TRUE
         ORDER BY f.created_at DESC`,
        [req.user.id]
      ),
      queryOne(
        `SELECT COUNT(*)::int AS total FROM follows WHERE followed_id = $1`,
        [req.user.id]
      ),
    ]);
    res.json({ followers, total: countRow.total });
  } catch (err) {
    console.error('Get followers error:', err);
    res.status(500).json({ error: 'Could not fetch followers' });
  }
});

// ── GET /api/follows/following ──────────────────────────────────────────────
// Returns everyone I follow (shown on the Friends page following tab).

router.get('/following', requireAuth, async (req, res) => {
  try {
    const following = await query(
      `SELECT u.id, u.display_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.followed_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ following });
  } catch (err) {
    console.error('Get following error:', err);
    res.status(500).json({ error: 'Could not fetch following list' });
  }
});

// ── POST /api/follows/:handle ───────────────────────────────────────────────
// Follow a creator by their display_name handle. Only creators are followable.

router.post('/:handle', requireAuth, async (req, res) => {
  try {
    const target = await queryOne(
      `SELECT id FROM users WHERE display_name = $1 AND creator_mode = TRUE`,
      [req.params.handle]
    );
    if (!target) return res.status(404).json({ error: 'Creator not found' });
    if (target.id === req.user.id) return res.status(400).json({ error: 'You cannot follow yourself' });

    await query(
      `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, target.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ error: 'Could not follow user' });
  }
});

// ── DELETE /api/follows/:handle ─────────────────────────────────────────────

router.delete('/:handle', requireAuth, async (req, res) => {
  try {
    const target = await queryOne(
      `SELECT id FROM users WHERE display_name = $1`,
      [req.params.handle]
    );
    if (!target) return res.status(404).json({ error: 'User not found' });

    await query(
      `DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2`,
      [req.user.id, target.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ error: 'Could not unfollow' });
  }
});

// ── POST /api/follows/toggle-creator ───────────────────────────────────────
// Enable or disable creator mode for the logged-in user.
// Enabling requires a display_name and triggers mutual auto-follow with the platform account.

router.post('/toggle-creator', requireAuth, async (req, res) => {
  const enabling = Boolean(req.body.creator_mode);

  try {
    const me = await queryOne(
      `SELECT display_name, creator_mode FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (enabling && !me.display_name?.trim()) {
      return res.status(400).json({
        error: 'Set a display name / handle in your profile before enabling creator mode.',
      });
    }

    await query('UPDATE users SET creator_mode = $1 WHERE id = $2', [enabling, req.user.id]);

    // First-time enable → mutual follow with platform account
    if (enabling && !me.creator_mode) {
      const platform = await queryOne(
        `SELECT id FROM users WHERE display_name = $1`,
        [PLATFORM_HANDLE]
      );
      if (platform) {
        await query(
          `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [req.user.id, platform.id]
        );
        await query(
          `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [platform.id, req.user.id]
        );
      }
    }

    res.json({ ok: true, creator_mode: enabling });
  } catch (err) {
    console.error('Toggle creator mode error:', err);
    res.status(500).json({ error: 'Could not update creator mode' });
  }
});

// ── GET /api/follows/feed ───────────────────────────────────────────────────
// Public wishlists from creators I follow — powers the Creators' Wishlists section.

router.get('/feed', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.id, w.title, w.event_date, w.share_token,
              u.id AS owner_id, u.display_name, u.name AS owner_name, u.avatar_url AS owner_avatar,
              (SELECT image_url FROM wishlist_items
               WHERE wishlist_id = w.id AND image_url IS NOT NULL
               ORDER BY priority ASC, created_at ASC LIMIT 1) AS cover_image
       FROM wishlists w
       JOIN users u ON u.id = w.user_id
       JOIN follows f ON f.followed_id = w.user_id
       WHERE f.follower_id = $1 AND w.is_public = TRUE
       ORDER BY w.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json({ wishlists });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Could not fetch feed' });
  }
});

// ── GET /api/follows/network-upcoming ──────────────────────────────────────
// Wishlists with upcoming event dates from creators I follow.

router.get('/network-upcoming', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.id, w.title, w.event_date, w.share_token,
              u.id AS owner_id, u.display_name, u.name AS owner_name, u.avatar_url AS owner_avatar,
              (SELECT image_url FROM wishlist_items
               WHERE wishlist_id = w.id AND image_url IS NOT NULL
               ORDER BY priority ASC LIMIT 1) AS cover_image
       FROM wishlists w
       JOIN users u ON u.id = w.user_id
       JOIN follows f ON f.followed_id = w.user_id
       WHERE f.follower_id = $1 AND w.is_public = TRUE AND w.event_date IS NOT NULL
       ORDER BY w.event_date ASC
       LIMIT 10`,
      [req.user.id]
    );
    res.json({ wishlists });
  } catch (err) {
    console.error('Network upcoming error:', err);
    res.status(500).json({ error: 'Could not fetch upcoming events' });
  }
});

// ── GET /api/follows/search?q=handle ───────────────────────────────────────
// Search for creator accounts by display_name handle.

router.get('/search', requireAuth, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ users: [] });

  try {
    const users = await query(
      `SELECT id, display_name, avatar_url,
              EXISTS(
                SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = id
              ) AS i_follow
       FROM users
       WHERE creator_mode = TRUE AND display_name ILIKE $2 AND id != $1
       ORDER BY display_name ASC
       LIMIT 10`,
      [req.user.id, `%${q}%`]
    );
    res.json({ users });
  } catch (err) {
    console.error('Creator search error:', err);
    res.status(500).json({ error: 'Could not search creators' });
  }
});

module.exports = router;
