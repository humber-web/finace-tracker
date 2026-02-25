import { pgTable, text, integer, index, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

// User management tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(), // serial is the standard auto-incrementing integer in Postgres
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at')
}, (table) => ({
  emailIdx: index('user_email_idx').on(table.email)
}));

export const oauthAccounts = pgTable('oauth_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  providerIdx: index('provider_account_idx').on(table.provider, table.providerAccountId),
  userIdx: index('oauth_user_idx').on(table.userId)
}));

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at')
}, (table) => ({
  tokenIdx: index('session_token_idx').on(table.token),
  userIdx: index('session_user_idx').on(table.userId),
  expiresIdx: index('session_expires_idx').on(table.expiresAt)
}));

// Application tables
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('expense'), // 'income' or 'expense'
  color: text('color').default('gray'),
  icon: text('icon'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  userIdx: index('category_user_idx').on(table.userId),
  systemIdx: index('category_system_idx').on(table.isSystem)
}));

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Stored in cents
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  type: text('type').notNull().default('expense'),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
  monthYearIdx: index('month_year_idx').on(table.month, table.year),
  typeIdx: index('type_idx').on(table.type),
  userIdx: index('transaction_user_idx').on(table.userId),
  userDateIdx: index('transaction_user_date_idx').on(table.userId, table.date)
}));

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  amount: integer('amount').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  categoryMonthYearIdx: index('category_month_year_idx').on(table.categoryId, table.month, table.year),
  userIdx: index('budget_user_idx').on(table.userId),
  userMonthYearIdx: index('budget_user_month_year_idx').on(table.userId, table.month, table.year)
}));

export const recurringTransactions = pgTable('recurring_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull().default('expense'),
  categoryId: integer('category_id').references(() => categories.id),
  frequency: text('frequency').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  nextOccurrence: timestamp('next_occurrence').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  nextOccurrenceIdx: index('next_occurrence_idx').on(table.nextOccurrence),
  isActiveIdx: index('is_active_idx').on(table.isActive),
  userIdx: index('recurring_user_idx').on(table.userId),
  userActiveIdx: index('recurring_user_active_idx').on(table.userId, table.isActive)
}));