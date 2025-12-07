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

  const body = await readBody(event)

  const updateData: any = {}

  if (body.amount !== undefined) updateData.amount = body.amount
  if (body.description !== undefined) updateData.description = body.description
  if (body.type !== undefined) updateData.type = body.type
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null
  if (body.frequency !== undefined) updateData.frequency = body.frequency
  if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
  if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
  if (body.nextOccurrence !== undefined) updateData.nextOccurrence = new Date(body.nextOccurrence)
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const result = await db
    .update(recurringTransactions)
    .set(updateData)
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

  return result[0]
})
