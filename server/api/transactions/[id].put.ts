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

  const body = await readBody(event)

  if (!body.amount || !body.description || !body.date || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const date = new Date(body.date)
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const result = await db
    .update(transactions)
    .set({
      amount: body.amount,
      description: body.description,
      date: date,
      month,
      year,
      type: body.type,
      categoryId: body.categoryId || null
    })
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

  return result[0]
})
