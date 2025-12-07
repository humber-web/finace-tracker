import { and, eq, lte } from 'drizzle-orm'
import { recurringTransactions, transactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

// Helper function to calculate next occurrence
function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate)

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
  const now = new Date()

  // Find all active recurring transactions that are due for this user
  const dueRecurring = await db
    .select()
    .from(recurringTransactions)
    .where(
      and(
        eq(recurringTransactions.userId, user.userId),
        eq(recurringTransactions.isActive, true),
        lte(recurringTransactions.nextOccurrence, now)
      )
    )

  let processedCount = 0

  for (const recurring of dueRecurring) {
    // Check if this recurring transaction has ended
    if (recurring.endDate && new Date(recurring.endDate) < now) {
      // Deactivate this recurring transaction
      await db
        .update(recurringTransactions)
        .set({ isActive: false })
        .where(eq(recurringTransactions.id, recurring.id))
      continue
    }

    // Create the transaction
    const transactionDate = new Date(recurring.nextOccurrence)
    const month = transactionDate.getMonth() + 1
    const year = transactionDate.getFullYear()

    await db.insert(transactions).values({
      userId: user.userId,
      amount: recurring.amount,
      description: recurring.description,
      date: transactionDate,
      month,
      year,
      type: recurring.type,
      categoryId: recurring.categoryId,
      createdAt: new Date()
    })

    // Update the next occurrence
    const nextOccurrence = calculateNextOccurrence(
      new Date(recurring.nextOccurrence),
      recurring.frequency
    )

    await db
      .update(recurringTransactions)
      .set({ nextOccurrence })
      .where(eq(recurringTransactions.id, recurring.id))

    processedCount++
  }

  return {
    success: true,
    processedCount,
    message: `Processed ${processedCount} recurring transaction(s)`
  }
})
