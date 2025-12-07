import { eq, and } from 'drizzle-orm'
import { transactions } from '../../database/schema'
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
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, user.userId)
      )
    )
    .returning()

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Transaction not found'
    })
  }

  return { success: true }
})
