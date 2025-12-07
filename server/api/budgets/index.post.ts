import { eq, and } from 'drizzle-orm'
import { budgets } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (!body.categoryId || !body.amount || !body.month || !body.year) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // Check if budget already exists for this user
  const existing = await db.select()
    .from(budgets)
    .where(and(
      eq(budgets.userId, user.userId),
      eq(budgets.categoryId, body.categoryId),
      eq(budgets.month, body.month),
      eq(budgets.year, body.year)
    ))
    .limit(1)

  if (existing.length > 0) {
    // Update existing budget
    const result = await db.update(budgets)
      .set({ amount: body.amount })
      .where(eq(budgets.id, existing[0].id))
      .returning()
    return result[0]
  } else {
    // Create new budget
    const result = await db.insert(budgets).values({
      userId: user.userId,
      categoryId: body.categoryId,
      amount: body.amount,
      month: body.month,
      year: body.year
    }).returning()
    return result[0]
  }
})
