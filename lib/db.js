const { Pool } = require('pg');

// Strip all query params from the URL — newer pg versions treat ?sslmode=require
// as verify-full (full cert check), which fails on Supabase's cert chain.
// We set ssl explicitly below instead.
const connectionString = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').split('?')[0];

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
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
