const { Pool } = require('pg');

// Supabase provides a connection pooler URL — use that in production
// so serverless functions don't exhaust PostgreSQL's connection limit.
// Find yours in: Supabase Dashboard → Settings → Database → Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Keep the pool small — in serverless each function invocation
  // creates its own pool instance, so a large max would exhaust connections.
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Convenience wrappers that match the query patterns used throughout the routes

/**
 * Run a query and return all matching rows.
 * @param {string} sql - Parameterised SQL using $1, $2 … placeholders
 * @param {any[]}  params
 * @returns {Promise<any[]>}
 */
async function query(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Run a query and return only the first row (or undefined).
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

module.exports = { pool, query, queryOne };
