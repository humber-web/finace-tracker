# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal financial management application built with Nuxt 4, using Nuxt UI components and a SQLite database with Drizzle ORM. The app helps users track income and expenses, manage budgets, set up recurring transactions, and analyze spending patterns.

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- **Framework**: Nuxt 4 with Vue 3 and TypeScript
- **UI**: Nuxt UI (v4) with Tailwind CSS v4
- **Charts**: Chart.js with vue-chartjs
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM and Drizzle Kit
- **Icons**: Lucide icons via @iconify-json/lucide
- **Server**: Nitro (built into Nuxt)

## Project Structure

```
app/
├── layouts/            # Layout components (default.vue with sidebar)
├── pages/              # Nuxt pages
│   ├── index.vue       # Redirects to /dashboard
│   └── dashboard.vue   # Main financial dashboard
├── components/         # Vue components
│   └── DateNavigation.vue  # Month/year selector
├── assets/css/         # Global CSS including Tailwind imports
server/                 # Server directory at ROOT level (not in app/)
│   ├── api/            # API endpoints organized by resource
│   │   ├── analytics/  # Trends and comparison analytics
│   │   ├── budgets/    # Budget CRUD and alerts
│   │   ├── categories/ # Category management
│   │   ├── recurring-transactions/  # Recurring transaction handling
│   │   ├── stats/      # Financial summary statistics
│   │   └── transactions/  # Transaction CRUD and queries
│   ├── database/
│   │   └── schema.ts   # Drizzle schema definitions
│   ├── plugins/
│   │   ├── migrate.ts  # Auto-run migrations on startup
│   │   └── seed.ts     # Seed default categories
│   └── utils/
│       ├── db.ts       # Database connection setup
│       └── migrate-recurring.ts  # Migration utilities
```

## Database Architecture

The application uses four main tables:

### 1. categories
- Stores income and expense categories
- Fields: id, name, type ('income'|'expense'), color, icon, createdAt
- Seeded with default categories on first run

### 2. transactions
- Core financial transactions
- Fields: id, amount (in cents), description, date, month, year, type, categoryId, createdAt
- Indexed on: date, (month, year), type
- Amounts stored as integers in cents to avoid floating-point issues

### 3. budgets
- Monthly budget limits per category
- Fields: id, categoryId, amount (in cents), month, year, createdAt
- Indexed on: (categoryId, month, year)

### 4. recurring_transactions
- Template for auto-generated recurring transactions
- Fields: id, amount, description, type, categoryId, frequency, startDate, endDate, nextOccurrence, isActive, createdAt
- Frequencies: 'daily', 'weekly', 'monthly', 'yearly'
- Indexed on: nextOccurrence, isActive

## Key Features

### Budget Alerts System
The `/api/budgets/alerts` endpoint provides predictive budget warnings:
- Calculates daily average spending
- Projects spending to end of month
- Returns alerts with severity levels: 'warning' (85%+), 'danger' (100%+), 'critical' (exceeded)
- Helps users avoid budget overruns before they happen

### Stats Summary
The `/api/stats/summary` endpoint aggregates:
- Total income and expenses for a given month/year
- Balance calculation
- Category breakdown with totals
- Default to current month if no query params provided

### Recurring Transactions
- Auto-migration on server startup creates the recurring_transactions table
- Process endpoint to generate actual transactions from recurring templates
- Track next occurrence date for automation

## Database Configuration

- Database file: `finance.db` (SQLite) in project root
- Drizzle config in `drizzle.config.ts`
- Schema: `app/server/database/schema.ts`
- Migrations output: `app/server/database/migrations/` (configured but not used yet)
- Runtime config: `dbPath` set via `useRuntimeConfig()`

## API Patterns

All API routes use Nuxt server directory conventions:

- `*.get.ts` - GET requests
- `*.post.ts` - POST requests
- `*.put.ts` - PUT requests (full updates)
- `*.patch.ts` - PATCH requests (partial updates)
- `*.delete.ts` - DELETE requests
- `[id].ts` - Dynamic route parameters

Example patterns:
- List: `/api/transactions/index.get.ts` → GET /api/transactions
- Read: `/api/transactions/[id].get.ts` → GET /api/transactions/:id
- Update: `/api/transactions/[id].put.ts` → PUT /api/transactions/:id
- Delete: `/api/transactions/[id].delete.ts` → DELETE /api/transactions/:id

## Database Access

Database instance is exported from `app/server/utils/db.ts`:
```typescript
import { db } from '~/server/utils/db'
```

Import schema tables as needed:
```typescript
import { transactions, categories, budgets, recurringTransactions } from '~/server/database/schema'
```

Use Drizzle query builders:
```typescript
// Simple select
await db.select().from(transactions)

// With joins
await db.select()
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
```

## Money Handling

**CRITICAL**: All monetary amounts are stored as integers in cents.
- Frontend displays: divide by 100
- Saving to DB: multiply by 100
- This avoids JavaScript floating-point precision issues

## Important Notes

- Server plugins run automatically on Nitro startup (migrations and seeding)
- The app uses Nuxt 4's new directory structure (`app/` instead of root-level directories)
- Nuxt UI components are auto-imported (UDashboardGroup, UNavigationMenu, etc.)
- App is currently in Portuguese (Gestor Financeiro = Financial Manager)
