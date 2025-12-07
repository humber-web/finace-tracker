import { sql, and, gte, lte, eq } from 'drizzle-orm'
import { transactions, categories } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const startDate = query.startDate ? new Date(query.startDate as string) : new Date(new Date().getFullYear(), 0, 1)
  const endDate = query.endDate ? new Date(query.endDate as string) : new Date()
  const groupBy = (query.groupBy as string) || 'month' // 'day', 'week', 'month'

  // Get all transactions in date range
  const result = await db
    .select({
      date: transactions.date,
      month: transactions.month,
      year: transactions.year,
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
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .orderBy(transactions.date)

  // Group data by time period
  const grouped: Record<string, {
    period: string
    income: number
    expense: number
    net: number
    transactions: number
    categoryBreakdown: Record<string, { name: string; amount: number; color: string | null }>
  }> = {}

  for (const tx of result) {
    const date = new Date(tx.date)
    let periodKey: string

    if (groupBy === 'day') {
      periodKey = date.toISOString().split('T')[0]
    } else if (groupBy === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      periodKey = weekStart.toISOString().split('T')[0]
    } else {
      // month
      periodKey = `${tx.year}-${String(tx.month).padStart(2, '0')}`
    }

    if (!grouped[periodKey]) {
      grouped[periodKey] = {
        period: periodKey,
        income: 0,
        expense: 0,
        net: 0,
        transactions: 0,
        categoryBreakdown: {}
      }
    }

    const amount = Number(tx.amount)

    if (tx.type === 'income') {
      grouped[periodKey].income += amount
      grouped[periodKey].net += amount
    } else {
      grouped[periodKey].expense += amount
      grouped[periodKey].net -= amount
    }

    grouped[periodKey].transactions++

    // Category breakdown
    if (tx.categoryId && tx.categoryName) {
      const categoryKey = tx.categoryId.toString()
      if (!grouped[periodKey].categoryBreakdown[categoryKey]) {
        grouped[periodKey].categoryBreakdown[categoryKey] = {
          name: tx.categoryName,
          amount: 0,
          color: tx.categoryColor
        }
      }
      grouped[periodKey].categoryBreakdown[categoryKey].amount += amount
    }
  }

  // Convert to array and sort
  const trends = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    groupBy,
    trends,
    summary: {
      totalIncome: trends.reduce((sum, t) => sum + t.income, 0),
      totalExpense: trends.reduce((sum, t) => sum + t.expense, 0),
      netIncome: trends.reduce((sum, t) => sum + t.net, 0),
      totalTransactions: result.length,
      averageIncome: trends.length > 0 ? trends.reduce((sum, t) => sum + t.income, 0) / trends.length : 0,
      averageExpense: trends.length > 0 ? trends.reduce((sum, t) => sum + t.expense, 0) / trends.length : 0
    }
  }
})
