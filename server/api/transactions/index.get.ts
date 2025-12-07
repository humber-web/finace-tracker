import { desc, eq } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const result = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    description: transactions.description,
    date: transactions.date,
    type: transactions.type,
    category: {
      id: categories.id,
      name: categories.name,
      color: categories.color
    }
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, user.userId))
  .orderBy(desc(transactions.date))

  return result
})
