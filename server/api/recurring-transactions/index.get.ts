import { desc, eq } from 'drizzle-orm'
import { recurringTransactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const result = await db
    .select({
      id: recurringTransactions.id,
      amount: recurringTransactions.amount,
      description: recurringTransactions.description,
      type: recurringTransactions.type,
      categoryId: recurringTransactions.categoryId,
      frequency: recurringTransactions.frequency,
      startDate: recurringTransactions.startDate,
      endDate: recurringTransactions.endDate,
      nextOccurrence: recurringTransactions.nextOccurrence,
      isActive: recurringTransactions.isActive,
      createdAt: recurringTransactions.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        icon: categories.icon
      }
    })
    .from(recurringTransactions)
    .leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
    .where(eq(recurringTransactions.userId, user.userId))
    .orderBy(desc(recurringTransactions.createdAt))

  return result
})
