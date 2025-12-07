import { inArray, and, eq } from 'drizzle-orm'
import { transactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Transaction IDs array is required'
    })
  }

  const result = await db
    .delete(transactions)
    .where(
      and(
        inArray(transactions.id, body.ids),
        eq(transactions.userId, user.userId)
      )
    )
    .returning()

  return { success: true, deletedCount: result.length }
})
