// Local development with SQLite
// import { drizzle } from 'drizzle-orm/better-sqlite3'
// import Database from 'better-sqlite3'

// const config = useRuntimeConfig()
// export const sqlite = new Database(config.dbPath)

// export const db = drizzle(sqlite)

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql'; // Import drizzle from the libsql adapter
import * as schema from '../database/schema'; // Assuming this is your schema file

// Load runtime configuration (including Turso secrets)
const config = useRuntimeConfig();

// 1. Get credentials from environment variables set in nuxt.config.ts
const dbUrl = config.tursoDatabaseUrl;
const authToken = config.tursoAuthToken;

if (!dbUrl || !authToken) {
  // Use a clear error message to remind you to set the environment variables
  throw new Error("Missing Turso database configuration. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment.");
}

// 2. Create the libSQL client
const sqlite = createClient({
  url: dbUrl,
  authToken: authToken,
});

// 3. Initialize Drizzle with the libSQL client and schema
export const db = drizzle(sqlite, { schema });
