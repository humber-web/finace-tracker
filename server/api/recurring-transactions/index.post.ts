import { recurringTransactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

// Helper function to calculate next occurrence
function calculateNextOccurrence(startDate: Date, frequency: string): Date {
  const next = new Date(startDate)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (!body.amount || !body.description || !body.frequency || !body.startDate || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly']
  if (!validFrequencies.includes(body.frequency)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid frequency. Must be daily, weekly, monthly, or yearly'
    })
  }

  const startDate = new Date(body.startDate)
  const endDate = body.endDate ? new Date(body.endDate) : null
  const nextOccurrence = calculateNextOccurrence(startDate, body.frequency)

  const result = await db
    .insert(recurringTransactions)
    .values({
      userId: user.userId,
      amount: body.amount,
      description: body.description,
      type: body.type,
      categoryId: body.categoryId || null,
      frequency: body.frequency,
      startDate,
      endDate,
      nextOccurrence,
      isActive: true,
      createdAt: new Date()
    })
    .returning()

  return result[0]
})
