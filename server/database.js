// node:sqlite is built into Node.js 22.12+ — no npm package needed
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// SQLite database file lives next to this script
const db = new DatabaseSync(path.join(__dirname, 'alliwant.db'));

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
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL,
      display_name   TEXT,                     -- public alias shown on wishlists (pseudo name)
      email          TEXT    UNIQUE NOT NULL,
      password       TEXT    NOT NULL,         -- bcrypt hash
      birthday       TEXT,                     -- ISO date string (YYYY-MM-DD)
      avatar_url     TEXT,
      -- Private mailing address — never exposed unless user opts in per-list
      street_address TEXT,
      city           TEXT,
      state          TEXT,
      zip_code       TEXT,
      country        TEXT    DEFAULT 'US',
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ── Wishlists ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS wishlists (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      title         TEXT    NOT NULL DEFAULT 'My Birthday Wishlist',
      description   TEXT,
      event_date    TEXT,
      is_public     INTEGER DEFAULT 1,
      share_address INTEGER DEFAULT 0,         -- 1 = show owner address to gifters
      use_real_name INTEGER DEFAULT 1,         -- 1 = show real name, 0 = show display name
      share_token   TEXT    UNIQUE,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ── Wishlist Items ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      wishlist_id    INTEGER NOT NULL,
      name           TEXT    NOT NULL,
      description    TEXT,
      price          REAL,
      url            TEXT,
      affiliate_url  TEXT,
      image_url      TEXT,
      priority       INTEGER DEFAULT 2,        -- 1 = high, 2 = medium, 3 = low
      is_purchased   INTEGER DEFAULT 0,
      purchased_by   INTEGER,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
      FOREIGN KEY (purchased_by) REFERENCES users(id)
    );

    -- ── Birthday Contacts ──────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS birthday_contacts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL,
      contact_name   TEXT    NOT NULL,
      contact_email  TEXT,
      birthday       TEXT    NOT NULL,
      notes          TEXT,
      wishlist_url   TEXT,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

  `);

  // ── Safe column migrations ─────────────────────────────────────────────────
  // ALTER TABLE ADD COLUMN is safe to run on existing databases.
  // SQLite will error if the column already exists, so we catch and ignore that.
  const migrations = [
    "ALTER TABLE users ADD COLUMN display_name   TEXT",
    "ALTER TABLE users ADD COLUMN street_address TEXT",
    "ALTER TABLE users ADD COLUMN city           TEXT",
    "ALTER TABLE users ADD COLUMN state          TEXT",
    "ALTER TABLE users ADD COLUMN zip_code       TEXT",
    "ALTER TABLE users ADD COLUMN country        TEXT DEFAULT 'US'",
    "ALTER TABLE wishlists ADD COLUMN share_address  INTEGER DEFAULT 0",
    // use_real_name: 1 = show real name on shared list (default, for family/friends)
    //                0 = show display name/alias (for privacy/social)
    "ALTER TABLE wishlists ADD COLUMN use_real_name  INTEGER DEFAULT 1",
  ];

  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  console.log('Database initialized.');
}

initializeDatabase();

module.exports = db;
