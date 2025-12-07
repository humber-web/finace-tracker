-- Migration: Add Multi-user Support
-- This migration adds user authentication tables and modifies existing tables
-- to support multiple users with complete data isolation

-- Step 1: Create new authentication tables

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  email_verified INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE INDEX IF NOT EXISTS user_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS provider_account_idx ON oauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS oauth_user_idx ON oauth_accounts(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_accessed_at INTEGER
);

CREATE INDEX IF NOT EXISTS session_token_idx ON sessions(token);
CREATE INDEX IF NOT EXISTS session_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS session_expires_idx ON sessions(expires_at);

-- Step 2: Create default admin user
INSERT INTO users (email, name, is_admin, email_verified, created_at)
SELECT 'admin@fintech.local', 'Admin User', 1, 1, strftime('%s', 'now') * 1000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@fintech.local');

-- Step 3: Add userId columns to existing tables (if not already present)
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we check first

-- For transactions table
ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- For budgets table
ALTER TABLE budgets ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- For recurring_transactions table
ALTER TABLE recurring_transactions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- For categories table
ALTER TABLE categories ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN is_system INTEGER DEFAULT 0;

-- Step 4: Migrate existing data to admin user (id = 1)
UPDATE transactions SET user_id = 1 WHERE user_id IS NULL;
UPDATE budgets SET user_id = 1 WHERE user_id IS NULL;
UPDATE recurring_transactions SET user_id = 1 WHERE user_id IS NULL;

-- Step 5: Mark existing categories as system categories (owned by admin)
UPDATE categories SET user_id = 1, is_system = 1 WHERE user_id IS NULL;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS transaction_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transaction_user_date_idx ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS budget_user_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budget_user_month_year_idx ON budgets(user_id, month, year);
CREATE INDEX IF NOT EXISTS recurring_user_idx ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS recurring_user_active_idx ON recurring_transactions(user_id, is_active);
CREATE INDEX IF NOT EXISTS category_user_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS category_system_idx ON categories(is_system);
