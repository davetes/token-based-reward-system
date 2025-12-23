const { Pool } = require("pg");

/**
 * PostgreSQL connection pool.
 *
 * Supported env vars:
 * - DATABASE_URL (recommended)
 * - or: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
 */
function buildPgConfig() {
  const ssl = process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined;

  // Prefer DATABASE_URL when provided.
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl
    };
  }

  // Otherwise fall back to discrete PG* env vars.
  return {
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl
  };
}

const pool = new Pool(buildPgConfig());

async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Creates required tables/indexes if they don't exist.
 * This is a lightweight alternative to a full migrations tool.
 */
async function initDb() {
  // Create tables.
  await query(`
    CREATE TABLE IF NOT EXISTS reward_actions (
      id BIGSERIAL PRIMARY KEY,
      user_address TEXT NOT NULL,
      action TEXT NOT NULL,
      reward_amount TEXT NOT NULL,
      transaction_hash TEXT NOT NULL UNIQUE,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id BIGSERIAL PRIMARY KEY,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount TEXT NOT NULL,
      type TEXT NOT NULL,
      action TEXT,
      transaction_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Indexes.
  await query(`CREATE INDEX IF NOT EXISTS idx_reward_actions_user_address ON reward_actions (user_address);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reward_actions_action ON reward_actions (action);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reward_actions_timestamp ON reward_actions (timestamp DESC);`);

  await query(`CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions (from_address);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions (to_address);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_transactions_action ON transactions (action);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions (timestamp DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_transactions_transaction_hash ON transactions (transaction_hash);`);
}

async function closeDb() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  initDb,
  closeDb
};
