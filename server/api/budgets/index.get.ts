import { sql, eq, and } from 'drizzle-orm'
import { budgets, categories, transactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const month = query.month ? parseInt(query.month as string) : new Date().getMonth() + 1
  const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()

  const result = await db.select({
    id: budgets.id,
    categoryId: budgets.categoryId,
    categoryName: categories.name,
    categoryColor: categories.color,
    budgetAmount: budgets.amount,
    month: budgets.month,
    year: budgets.year,
    spent: sql<number>`COALESCE((
      SELECT SUM(${transactions.amount})
      FROM ${transactions}
      WHERE ${transactions.categoryId} = ${budgets.categoryId}
        AND ${transactions.month} = ${budgets.month}
        AND ${transactions.year} = ${budgets.year}
        AND ${transactions.type} = 'expense'
        AND ${transactions.userId} = ${user.userId}
    ), 0)`
  })
  .from(budgets)
  .leftJoin(categories, eq(budgets.categoryId, categories.id))
  .where(and(
    eq(budgets.userId, user.userId),
    eq(budgets.month, month),
    eq(budgets.year, year)
  ))

  return result
})
