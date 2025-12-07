import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

// User management tables
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' })
}, (table) => ({
  emailIdx: index('user_email_idx').on(table.email)
}))

export const oauthAccounts = sqliteTable('oauth_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
}, (table) => ({
  providerIdx: index('provider_account_idx').on(table.provider, table.providerAccountId),
  userIdx: index('oauth_user_idx').on(table.userId)
}))

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' })
}, (table) => ({
  tokenIdx: index('session_token_idx').on(table.token),
  userIdx: index('session_user_idx').on(table.userId),
  expiresIdx: index('session_expires_idx').on(table.expiresAt)
}))

// Application tables
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull().default('expense'), // 'income' or 'expense'
  color: text('color').default('gray'),
  icon: text('icon'), // Optional icon name
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // NULL for system categories
  isSystem: integer('is_system', { mode: 'boolean' }).default(false), // System categories shared across users
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
}, (table) => ({
  userIdx: index('category_user_idx').on(table.userId),
  systemIdx: index('category_system_idx').on(table.isSystem)
}))

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Stored in cents
  description: text('description').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(), // e.g., 2025
  type: text('type').notNull().default('expense'), // 'income' or 'expense'
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
  monthYearIdx: index('month_year_idx').on(table.month, table.year),
  typeIdx: index('type_idx').on(table.type),
  userIdx: index('transaction_user_idx').on(table.userId),
  userDateIdx: index('transaction_user_date_idx').on(table.userId, table.date)
}))

export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  amount: integer('amount').notNull(), // Monthly budget in cents
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(), // e.g., 2025
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
}, (table) => ({
  categoryMonthYearIdx: index('category_month_year_idx').on(table.categoryId, table.month, table.year),
  userIdx: index('budget_user_idx').on(table.userId),
  userMonthYearIdx: index('budget_user_month_year_idx').on(table.userId, table.month, table.year)
}))

export const recurringTransactions = sqliteTable('recurring_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Stored in cents
  description: text('description').notNull(),
  type: text('type').notNull().default('expense'), // 'income' or 'expense'
  categoryId: integer('category_id').references(() => categories.id),
  frequency: text('frequency').notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }), // Optional - null means no end date
  nextOccurrence: integer('next_occurrence', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
}, (table) => ({
  nextOccurrenceIdx: index('next_occurrence_idx').on(table.nextOccurrence),
  isActiveIdx: index('is_active_idx').on(table.isActive),
  userIdx: index('recurring_user_idx').on(table.userId),
  userActiveIdx: index('recurring_user_active_idx').on(table.userId, table.isActive)
}))
