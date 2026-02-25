import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../database/schema';
import fs from 'node:fs';
import path from 'node:path';

const config = useRuntimeConfig();

// Ensure the directory for the database exists (crucial for Dokploy Volumes)
const dbFile = config.dbPath || './finance.db';
const dbDir = path.dirname(dbFile);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbFile);

// Enable WAL mode for better performance with SQLite
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });