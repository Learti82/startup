import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: env.nodeEnv === 'production' && process.env.DATABASE_SSL !== 'false'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.nodeEnv === 'development' && duration > 200) {
    console.log('Slow query detected', { text: text.substring(0, 80), duration });
  }
  return res;
}

export async function getClient() {
  return pool.connect();
}

export { pool };
