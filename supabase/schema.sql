-- ============================================================
--  AllIWant — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT        NOT NULL,
  display_name   TEXT,                        -- public alias shown on wishlists
  email          TEXT        UNIQUE NOT NULL,
  password       TEXT        NOT NULL,        -- bcrypt hash, never returned to client
  birthday       TEXT,                        -- YYYY-MM-DD
  avatar_url     TEXT,
  -- Private mailing address — never exposed unless user opts in per-list
  street_address TEXT,
  city           TEXT,
  state          TEXT,
  zip_code       TEXT,
  country        TEXT        DEFAULT 'US',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wishlists ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL DEFAULT 'My Birthday Wishlist',
  description    TEXT,
  event_date     TEXT,
  is_public      BOOLEAN     DEFAULT TRUE,
  share_address  BOOLEAN     DEFAULT FALSE,   -- show owner address to gifters
  use_real_name  BOOLEAN     DEFAULT TRUE,    -- true = show real name, false = show display name
  share_token    TEXT        UNIQUE,          -- random token for shareable URL
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wishlist Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id             BIGSERIAL PRIMARY KEY,
  wishlist_id    BIGINT      NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2),
  url            TEXT,
  affiliate_url  TEXT,
  image_url      TEXT,
  priority       INTEGER     DEFAULT 2,       -- 1 = high, 2 = medium, 3 = low
  is_purchased   BOOLEAN     DEFAULT FALSE,
  purchased_by   BIGINT      REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Birthday Contacts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS birthday_contacts (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name   TEXT        NOT NULL,
  contact_email  TEXT,
  birthday       TEXT        NOT NULL,        -- YYYY-MM-DD
  notes          TEXT,
  wishlist_url   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for common query patterns ───────────────────────
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id     ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_token ON wishlists(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_list   ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_birthday_contacts_user ON birthday_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
