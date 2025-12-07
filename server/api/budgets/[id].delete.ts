import { eq, and } from 'drizzle-orm'
import { budgets } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Budget ID is required'
    })
  }

  const result = await db
    .delete(budgets)
    .where(
      and(
        eq(budgets.id, parseInt(id)),
        eq(budgets.userId, user.userId)
      )
    )
    .returning()

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Budget not found'
    })
  }

  return { success: true }
})
