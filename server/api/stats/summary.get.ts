import { sql, eq, and } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const month = query.month ? parseInt(query.month as string) : new Date().getMonth() + 1
  const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()

  // Get income total
  const incomeResult = await db.select({
    total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
  })
  .from(transactions)
  .where(and(
    eq(transactions.userId, user.userId),
    eq(transactions.type, 'income'),
    eq(transactions.month, month),
    eq(transactions.year, year)
  ))

  // Get expense total
  const expenseResult = await db.select({
    total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
  })
  .from(transactions)
  .where(and(
    eq(transactions.userId, user.userId),
    eq(transactions.type, 'expense'),
    eq(transactions.month, month),
    eq(transactions.year, year)
  ))

  // Get category breakdown
  const categoryBreakdown = await db.select({
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    categoryType: categories.type,
    categoryColor: categories.color,
    total: sql<number>`SUM(${transactions.amount})`
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(and(
    eq(transactions.userId, user.userId),
    eq(transactions.month, month),
    eq(transactions.year, year)
  ))
  .groupBy(transactions.categoryId, categories.name, categories.type, categories.color)

  const income = incomeResult[0]?.total || 0
  const expenses = expenseResult[0]?.total || 0
  const balance = income - expenses

  return {
    month,
    year,
    income,
    expenses,
    balance,
    categoryBreakdown
  }
})
