import { and, gte, lte, eq } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  // Period A
  const startDateA = new Date(query.startDateA as string)
  const endDateA = new Date(query.endDateA as string)

  // Period B
  const startDateB = new Date(query.startDateB as string)
  const endDateB = new Date(query.endDateB as string)

  // Fetch Period A data
  const periodAData = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, user.userId),
        gte(transactions.date, startDateA),
        lte(transactions.date, endDateA)
      )
    )

  // Fetch Period B data
  const periodBData = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, user.userId),
        gte(transactions.date, startDateB),
        lte(transactions.date, endDateB)
      )
    )

  // Aggregate Period A
  const periodA = {
    income: 0,
    expense: 0,
    net: 0,
    transactions: periodAData.length,
    categoryBreakdown: {} as Record<string, { name: string; amount: number; color: string | null }>
  }

  for (const tx of periodAData) {
    const amount = Number(tx.amount)
    if (tx.type === 'income') {
      periodA.income += amount
      periodA.net += amount
    } else {
      periodA.expense += amount
      periodA.net -= amount
    }

    if (tx.categoryId && tx.categoryName) {
      const key = tx.categoryId.toString()
      if (!periodA.categoryBreakdown[key]) {
        periodA.categoryBreakdown[key] = { name: tx.categoryName, amount: 0, color: tx.categoryColor }
      }
      periodA.categoryBreakdown[key].amount += amount
    }
  }

  // Aggregate Period B
  const periodB = {
    income: 0,
    expense: 0,
    net: 0,
    transactions: periodBData.length,
    categoryBreakdown: {} as Record<string, { name: string; amount: number; color: string | null }>
  }

  for (const tx of periodBData) {
    const amount = Number(tx.amount)
    if (tx.type === 'income') {
      periodB.income += amount
      periodB.net += amount
    } else {
      periodB.expense += amount
      periodB.net -= amount
    }

    if (tx.categoryId && tx.categoryName) {
      const key = tx.categoryId.toString()
      if (!periodB.categoryBreakdown[key]) {
        periodB.categoryBreakdown[key] = { name: tx.categoryName, amount: 0, color: tx.categoryColor }
      }
      periodB.categoryBreakdown[key].amount += amount
    }
  }

  // Calculate differences
  const difference = {
    income: periodB.income - periodA.income,
    expense: periodB.expense - periodA.expense,
    net: periodB.net - periodA.net,
    transactions: periodB.transactions - periodA.transactions,
    incomePercent: periodA.income > 0 ? ((periodB.income - periodA.income) / periodA.income) * 100 : 0,
    expensePercent: periodA.expense > 0 ? ((periodB.expense - periodA.expense) / periodA.expense) * 100 : 0,
    netPercent: periodA.net !== 0 ? ((periodB.net - periodA.net) / Math.abs(periodA.net)) * 100 : 0
  }

  return {
    periodA: {
      startDate: startDateA.toISOString(),
      endDate: endDateA.toISOString(),
      ...periodA
    },
    periodB: {
      startDate: startDateB.toISOString(),
      endDate: endDateB.toISOString(),
      ...periodB
    },
    difference
  }
})
