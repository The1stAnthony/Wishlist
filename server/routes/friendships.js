const express     = require('express');
const { v4: uuid } = require('uuid');
const { query, queryOne } = require('../../lib/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/friendships ────────────────────────────────────────────────────
// Returns accepted friends + pending outgoing + pending incoming.

router.get('/', requireAuth, async (req, res) => {
  try {
    const [friends, outgoing, incoming] = await Promise.all([
      query(
        `SELECT f.id, f.created_at,
                u.id AS friend_id, u.name AS friend_name, u.display_name, u.avatar_url
         FROM friendships f
         JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
         WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
         ORDER BY u.name ASC`,
        [req.user.id]
      ),
      query(
        `SELECT f.id,
                u.id AS friend_id, u.name AS friend_name, u.display_name, u.avatar_url
         FROM friendships f
         JOIN users u ON u.id = f.addressee_id
         WHERE f.requester_id = $1 AND f.status = 'pending' AND f.addressee_id IS NOT NULL
         ORDER BY f.created_at DESC`,
        [req.user.id]
      ),
      query(
        `SELECT f.id,
                u.id AS friend_id, u.name AS friend_name, u.display_name, u.avatar_url
         FROM friendships f
         JOIN users u ON u.id = f.requester_id
         WHERE f.addressee_id = $1 AND f.status = 'pending'
         ORDER BY f.created_at DESC`,
        [req.user.id]
      ),
    ]);
    res.json({ friends, outgoing, incoming });
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ error: 'Could not fetch friends' });
  }
});

// ── POST /api/friendships/invite ────────────────────────────────────────────
// Generates (or retrieves existing) invite link token for sharing externally.

router.post('/invite', requireAuth, async (req, res) => {
  try {
    const existing = await queryOne(
      `SELECT invite_token FROM friendships
       WHERE requester_id = $1 AND addressee_id IS NULL AND status = 'pending'`,
      [req.user.id]
    );

    if (existing) return res.json({ token: existing.invite_token });

    const token = uuid().replace(/-/g, '');
    await query(
      `INSERT INTO friendships (requester_id, addressee_id, status, invite_token)
       VALUES ($1, NULL, 'pending', $2)`,
      [req.user.id, token]
    );
    res.json({ token });
  } catch (err) {
    console.error('Create invite error:', err);
    res.status(500).json({ error: 'Could not create invite link' });
  }
});

// ── POST /api/friendships/request-by-email ──────────────────────────────────
// Sends a friend request to someone by their registered email.

router.post('/request-by-email', requireAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const target = await queryOne(
      `SELECT id, name, display_name FROM users WHERE email = $1 AND id != $2`,
      [email.toLowerCase().trim(), req.user.id]
    );
    if (!target) return res.status(404).json({ error: 'No account found with that email.' });

    const existing = await queryOne(
      `SELECT id, status FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [req.user.id, target.id]
    );

    if (existing) {
      if (existing.status === 'accepted') return res.status(409).json({ error: 'You are already friends.' });
      return res.status(409).json({ error: 'A friend request already exists.' });
    }

    await query(
      `INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1, $2, 'pending')`,
      [req.user.id, target.id]
    );
    res.json({ ok: true, message: `Friend request sent to ${target.name || target.display_name}.` });
  } catch (err) {
    console.error('Friend request by email error:', err);
    res.status(500).json({ error: 'Could not send friend request' });
  }
});

// ── GET /api/friendships/join/:token ───────────────────────────────────────
// Public — returns info about the inviter so the acceptance page can show their name.

router.get('/join/:token', async (req, res) => {
  try {
    const invite = await queryOne(
      `SELECT f.id, u.id AS requester_id, u.name AS requester_name,
              u.display_name, u.avatar_url
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.invite_token = $1 AND f.status = 'pending'`,
      [req.params.token]
    );
    if (!invite) return res.status(404).json({ error: 'This invite link is invalid or has already been used.' });
    res.json({ invite });
  } catch (err) {
    console.error('Get invite error:', err);
    res.status(500).json({ error: 'Could not fetch invite' });
  }
});

// ── POST /api/friendships/join/:token ──────────────────────────────────────
// Claim an invite link. The act of clicking + submitting IS the acceptance.

router.post('/join/:token', requireAuth, async (req, res) => {
  try {
    const invite = await queryOne(
      `SELECT id, requester_id FROM friendships WHERE invite_token = $1 AND status = 'pending'`,
      [req.params.token]
    );
    if (!invite) return res.status(404).json({ error: 'This invite link is invalid or has already been used.' });
    if (invite.requester_id === req.user.id) return res.status(400).json({ error: 'You cannot accept your own invite.' });

    const alreadyFriends = await queryOne(
      `SELECT id FROM friendships
       WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
         AND id != $3 AND status = 'accepted'`,
      [req.user.id, invite.requester_id, invite.id]
    );
    if (alreadyFriends) return res.status(409).json({ error: 'You are already friends with this person.' });

    await query(
      `UPDATE friendships SET addressee_id = $1, status = 'accepted', invite_token = NULL WHERE id = $2`,
      [req.user.id, invite.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Claim invite error:', err);
    res.status(500).json({ error: 'Could not accept invite' });
  }
});

// ── PATCH /api/friendships/:id/accept ──────────────────────────────────────

router.patch('/:id/accept', requireAuth, async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT id FROM friendships WHERE id = $1 AND addressee_id = $2 AND status = 'pending'`,
      [req.params.id, req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Friend request not found' });

    await query(`UPDATE friendships SET status = 'accepted' WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ error: 'Could not accept request' });
  }
});

// ── PATCH /api/friendships/:id/decline ─────────────────────────────────────

router.patch('/:id/decline', requireAuth, async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT id FROM friendships WHERE id = $1 AND addressee_id = $2 AND status = 'pending'`,
      [req.params.id, req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Friend request not found' });

    await query(`DELETE FROM friendships WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Decline request error:', err);
    res.status(500).json({ error: 'Could not decline request' });
  }
});

// ── DELETE /api/friendships/:id ─────────────────────────────────────────────
// Cancel outgoing request OR unfriend an accepted connection.

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM friendships
       WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2)
       RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.length) return res.status(404).json({ error: 'Friendship not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete friendship error:', err);
    res.status(500).json({ error: 'Could not remove friend' });
  }
});

// ── GET /api/friendships/feed ───────────────────────────────────────────────
// Wishlists from accepted friends. Includes any visibility tier since the
// viewer IS a friend. No date filter — shows all-time wishlists.

router.get('/feed', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.id, w.title, w.event_date, w.share_token, w.visibility, w.theme_image_url,
              u.id AS owner_id, u.name AS owner_name, u.display_name, u.avatar_url AS owner_avatar,
              (SELECT image_url FROM wishlist_items
               WHERE wishlist_id = w.id AND image_url IS NOT NULL
               ORDER BY priority ASC, created_at ASC LIMIT 1) AS cover_image,
              (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = w.id)::int AS item_count
       FROM wishlists w
       JOIN users u ON u.id = w.user_id
       JOIN friendships f
         ON (f.requester_id = $1 AND f.addressee_id = w.user_id)
         OR (f.addressee_id = $1 AND f.requester_id = w.user_id)
       WHERE f.status = 'accepted'
         AND (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = w.id) > 0
         AND (
           COALESCE(w.visibility, 'public') = 'friends'
           OR (
             COALESCE(w.visibility, 'public') = 'specific'
             AND EXISTS (
               SELECT 1 FROM wishlist_permissions wp
               WHERE wp.wishlist_id = w.id AND wp.user_id = $1
             )
           )
         )
       ORDER BY COALESCE(
         (SELECT MAX(i.created_at) FROM wishlist_items i WHERE i.wishlist_id = w.id),
         w.created_at
       ) DESC
       LIMIT 30`,
      [req.user.id]
    );
    res.json({ wishlists });
  } catch (err) {
    console.error('Friends feed error:', err);
    res.status(500).json({ error: 'Could not fetch friends\' wishlists' });
  }
});

// ── GET /api/friendships/upcoming ──────────────────────────────────────────
// Friends' wishlists with upcoming event dates — for the Dashboard events row.
// Shows real name (not alias) since these are personal friends.

router.get('/upcoming', requireAuth, async (req, res) => {
  try {
    const wishlists = await query(
      `SELECT w.id, w.title, w.event_date, w.share_token, w.theme_image_url,
              u.id AS owner_id, u.name AS owner_name, u.display_name, u.avatar_url AS owner_avatar,
              (SELECT image_url FROM wishlist_items
               WHERE wishlist_id = w.id AND image_url IS NOT NULL
               ORDER BY priority ASC LIMIT 1) AS cover_image
       FROM wishlists w
       JOIN users u ON u.id = w.user_id
       JOIN friendships f
         ON (f.requester_id = $1 AND f.addressee_id = w.user_id)
         OR (f.addressee_id = $1 AND f.requester_id = w.user_id)
       WHERE f.status = 'accepted'
         AND w.event_date IS NOT NULL
         AND w.event_date::date >= CURRENT_DATE - INTERVAL '7 days'
         AND (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = w.id) > 0
         AND (
           COALESCE(w.visibility, 'public') = 'friends'
           OR (
             COALESCE(w.visibility, 'public') = 'specific'
             AND EXISTS (
               SELECT 1 FROM wishlist_permissions wp
               WHERE wp.wishlist_id = w.id AND wp.user_id = $1
             )
           )
         )
       ORDER BY w.event_date::date ASC
       LIMIT 10`,
      [req.user.id]
    );
    res.json({ wishlists });
  } catch (err) {
    console.error('Friends upcoming error:', err);
    res.status(500).json({ error: 'Could not fetch upcoming events' });
  }
});

module.exports = router;
