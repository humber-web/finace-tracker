import { eq, and } from 'drizzle-orm'
import { recurringTransactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Recurring transaction ID is required'
    })
  }

  const result = await db
    .delete(recurringTransactions)
    .where(
      and(
        eq(recurringTransactions.id, parseInt(id)),
        eq(recurringTransactions.userId, user.userId)
      )
    )
    .returning()

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Recurring transaction not found'
    })
  }

  return { success: true }
})
