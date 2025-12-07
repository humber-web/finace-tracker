import { transactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  // Basic validation
  if (!body.amount || !body.description || !body.date || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const date = new Date(body.date)
  const month = date.getMonth() + 1 // 1-12
  const year = date.getFullYear()

  const result = await db.insert(transactions).values({
    userId: user.userId,
    amount: body.amount,
    description: body.description,
    date: date,
    month,
    year,
    type: body.type,
    categoryId: body.categoryId
  }).returning()

  return result[0]
})
