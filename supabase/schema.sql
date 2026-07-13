-- ============================================================
--  AllIWant — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
--  This is the canonical schema for a fresh install.
--  For an existing DB run migrations instead (see supabase/*.sql).
-- ============================================================

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL    PRIMARY KEY,
  name           TEXT         NOT NULL,
  display_name   TEXT,                         -- public alias; shown on public wishlists
  email          TEXT         UNIQUE NOT NULL,
  password       TEXT         NOT NULL,         -- bcrypt hash, never returned to client
  birthday       TEXT,                          -- YYYY-MM-DD
  avatar_url     TEXT,
  creator_mode   BOOLEAN      DEFAULT FALSE,    -- unlocks public visibility + one-way follows
  reset_token    TEXT,                          -- password-reset token (hex)
  reset_expires  TIMESTAMPTZ,                   -- 1-hour expiry for reset_token
  -- Private mailing address — never exposed unless user opts in per-list
  street_address TEXT,
  city           TEXT,
  state          TEXT,
  zip_code       TEXT,
  country        TEXT         DEFAULT 'US',
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Wishlists ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT         NOT NULL DEFAULT 'My Birthday Wishlist',
  description    TEXT,
  event_date     TEXT,                          -- YYYY-MM-DD stored as text
  is_public      BOOLEAN      DEFAULT FALSE,    -- derived from visibility; kept for legacy queries
  visibility     TEXT         DEFAULT 'friends', -- 'public' | 'friends' | 'specific'
  share_address  BOOLEAN      DEFAULT FALSE,    -- show owner address to gifters
  use_real_name  BOOLEAN      DEFAULT TRUE,
  spoiler_free   BOOLEAN      NOT NULL DEFAULT TRUE,  -- owner can't see who bought what
  theme_image_url TEXT,                         -- base64 data URI; client-side compressed
  share_token    TEXT         UNIQUE,           -- random 16-char token for shareable URL
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Wishlist Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id              BIGSERIAL    PRIMARY KEY,
  wishlist_id     BIGINT       NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  name            TEXT         NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2),
  url             TEXT,
  affiliate_url   TEXT,
  image_url       TEXT,
  priority        INTEGER      DEFAULT 2,        -- 1 = high, 2 = medium, 3 = low
  quantity        INTEGER      NOT NULL DEFAULT 1,
  purchased_count INTEGER      NOT NULL DEFAULT 0,
  is_purchased    BOOLEAN      DEFAULT FALSE,    -- true when purchased_count >= quantity
  purchased_by    BIGINT       REFERENCES users(id),
  item_group_id   TEXT,                          -- links same URL across multiple lists
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Birthday Contacts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS birthday_contacts (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name   TEXT         NOT NULL,
  contact_email  TEXT,
  birthday       TEXT         NOT NULL,          -- YYYY-MM-DD
  notes          TEXT,
  wishlist_url   TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Follows (creator one-way follow graph) ──────────────────
-- Regular users follow creator accounts; only creators appear in public feeds.
CREATE TABLE IF NOT EXISTS follows (
  id          BIGSERIAL    PRIMARY KEY,
  follower_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (follower_id, followed_id)
);

-- ── Friendships (mutual friend graph) ──────────────────────
-- status: 'pending' | 'accepted'
-- invite_token: set on the placeholder row used for link-based invites (addressee_id IS NULL)
CREATE TABLE IF NOT EXISTS friendships (
  id           BIGSERIAL    PRIMARY KEY,
  requester_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id BIGINT       REFERENCES users(id) ON DELETE CASCADE,  -- NULL until invite is accepted
  status       TEXT         NOT NULL DEFAULT 'pending',
  invite_token TEXT         UNIQUE,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Wishlist Permissions (specific-tier access) ─────────────
CREATE TABLE IF NOT EXISTS wishlist_permissions (
  wishlist_id BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, user_id)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email                ON users(email);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id          ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_token      ON wishlists(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlists_visibility       ON wishlists(visibility);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_list        ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_group       ON wishlist_items(item_group_id) WHERE item_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_birthday_contacts_user     ON birthday_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower           ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed           ON follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester      ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee      ON friendships(addressee_id) WHERE addressee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_friendships_invite_token   ON friendships(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishlist_permissions_user  ON wishlist_permissions(user_id);
