const { Database } = require('node-sqlite3-wasm');
const path = require('path');

// SQLite database file lives next to this script
const db = new Database(path.join(__dirname, 'wishday.db'));

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/**
 * Creates all tables on first run.
 * Using IF NOT EXISTS means this is safe to call every startup.
 */
function initializeDatabase() {
  db.exec(`

    -- ── Users ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    UNIQUE NOT NULL,
      password    TEXT    NOT NULL,         -- bcrypt hash
      birthday    TEXT,                     -- ISO date string (YYYY-MM-DD)
      avatar_url  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ── Wishlists ──────────────────────────────────────────────────────────
    -- A user can have multiple wishlists (e.g. one per birthday year, or a general list)
    CREATE TABLE IF NOT EXISTS wishlists (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      title       TEXT    NOT NULL DEFAULT 'My Birthday Wishlist',
      description TEXT,
      event_date  TEXT,                     -- the birthday / occasion date
      is_public   INTEGER DEFAULT 1,        -- 1 = anyone with the link can view
      share_token TEXT    UNIQUE,           -- random token used in the shareable URL
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ── Wishlist Items ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      wishlist_id    INTEGER NOT NULL,
      name           TEXT    NOT NULL,
      description    TEXT,
      price          REAL,                  -- user-provided estimated price
      url            TEXT,                  -- original product URL (any retailer)
      affiliate_url  TEXT,                  -- Amazon affiliate URL (auto-generated or manual)
      image_url      TEXT,
      priority       INTEGER DEFAULT 2,     -- 1 = high, 2 = medium, 3 = low
      is_purchased   INTEGER DEFAULT 0,
      purchased_by   INTEGER,               -- user_id of the gifter who marked it bought
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
      FOREIGN KEY (purchased_by) REFERENCES users(id)
    );

    -- ── Birthday Contacts ──────────────────────────────────────────────────
    -- People whose birthdays the logged-in user wants to track
    CREATE TABLE IF NOT EXISTS birthday_contacts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL,      -- the user who is tracking this contact
      contact_name   TEXT    NOT NULL,
      contact_email  TEXT,
      birthday       TEXT    NOT NULL,      -- YYYY-MM-DD (year can be 0000 if unknown)
      notes          TEXT,
      wishlist_url   TEXT,                  -- optional: link to their WishDay wishlist
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

  `);

  console.log('Database initialized.');
}

initializeDatabase();

module.exports = db;
