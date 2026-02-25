import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema';

const config = useRuntimeConfig();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: config.dbUrl || process.env.DATABASE_URL,
});

// Log database connection status
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Successfully connected to the database.');
    release();
  }
});

// Initialize Drizzle with the PostgreSQL pool and schema
export const db = drizzle(pool, { schema });