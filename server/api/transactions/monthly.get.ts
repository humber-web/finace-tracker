import { desc, eq, and } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const month = query.month ? parseInt(query.month as string) : undefined
  const year = query.year ? parseInt(query.year as string) : undefined

  let whereConditions = [eq(transactions.userId, user.userId)]

  if (month) {
    whereConditions.push(eq(transactions.month, month))
  }

  if (year) {
    whereConditions.push(eq(transactions.year, year))
  }

  const result = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    description: transactions.description,
    date: transactions.date,
    month: transactions.month,
    year: transactions.year,
    type: transactions.type,
    category: {
      id: categories.id,
      name: categories.name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon
    }
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(and(...whereConditions))
  .orderBy(desc(transactions.date))

  return result
})
