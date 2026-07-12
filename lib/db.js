const { Pool } = require('pg');

// Parse the URL into individual fields so pg never sees a connectionString —
// this prevents pg-connection-string from injecting sslmode back into the
// SSL config and overriding our explicit rejectUnauthorized: false.
function parseDbUrl(raw) {
  try {
    const u = new URL(raw);
    return {
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host:     u.hostname,
      port:     u.port ? parseInt(u.port, 10) : 5432,
      database: u.pathname.replace(/^\//, ''),
    };
  } catch {
    return {};
  }
}

const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const pool = new Pool({
  ...parseDbUrl(raw),
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function query(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

module.exports = { pool, query, queryOne };
