import { eq, and } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Transaction ID is required'
    })
  }

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      month: transactions.month,
      year: transactions.year,
      type: transactions.type,
      categoryId: transactions.categoryId,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        icon: categories.icon
      }
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, user.userId)
      )
    )
    .limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Transaction not found'
    })
  }

  return result[0]
})
