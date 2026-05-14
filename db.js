import { Pool } from 'pg';
import 'dotenv/config';

let pool;

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || '';
}

function getPool() {
  if (!pool) {
    const connectionString = getConnectionString();

    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada. Use uma string de conexão PostgreSQL (Neon, Supabase, etc).');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.DB_POOL_MAX || 10),
    });
  }

  return pool;
}

function normalizeQuery(text) {
  let index = 0;
  return String(text).replace(/\?/g, () => `$${++index}`);
}

async function query(text, values = []) {
  const result = await getPool().query(normalizeQuery(text), values);
  return [result.rows, result];
}

async function execute(text, values = []) {
  return query(text, values);
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  query,
  execute,
  close,
};