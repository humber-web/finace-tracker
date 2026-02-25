// Local development with SQLite
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../database/schema'; // Assuming this is your schema file

// Load runtime configuration
const config = useRuntimeConfig();

// Initialize SQLite database connection
const sqlite = new Database(config.dbPath || './finance.db');

// Initialize Drizzle with the SQLite database and schema
export const db = drizzle(sqlite, { schema });
