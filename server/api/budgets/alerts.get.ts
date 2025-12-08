import { sql, eq, and } from 'drizzle-orm'
import { budgets, categories, transactions } from '../../database/schema'
import { db } from '../../utils/db'
import { requireAuth } from '../../utils/auth-helpers'

interface BudgetAlert {
  id: number
  categoryId: number
  categoryName: string
  budgetAmount: number
  spent: number
  projectedSpending: number
  percentUsed: number
  projectedPercent: number
  daysRemaining: number
  dailyAverage: number
  alertLevel: 'warning' | 'danger' | 'critical'
  message: string
}

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const month = query.month ? parseInt(query.month as string) : new Date().getMonth() + 1
  const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()

  // Get current day of month
  const now = new Date()
  const currentDay = now.getDate()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysRemaining = daysInMonth - currentDay

  // Get budgets with spending data for this user
  const result = await db.select({
    id: budgets.id,
    categoryId: budgets.categoryId,
    categoryName: categories.name,
    budgetAmount: budgets.amount,
    spent: sql<number>`COALESCE((
      SELECT SUM(${transactions.amount})
      FROM ${transactions}
      WHERE ${transactions.categoryId} = ${budgets.categoryId}
        AND ${transactions.month} = ${budgets.month}
        AND ${transactions.year} = ${budgets.year}
        AND ${transactions.type} = 'expense'
        AND ${transactions.userId} = ${user.userId}
    ), 0)`
  })
  .from(budgets)
  .leftJoin(categories, eq(budgets.categoryId, categories.id))
  .where(and(
    eq(budgets.userId, user.userId),
    eq(budgets.month, month),
    eq(budgets.year, year)
  ))

  // Calculate predictive alerts
  const alerts: BudgetAlert[] = []

  for (const budget of result) {
    const spent = Number(budget.spent)
    const budgetAmount = budget.budgetAmount
    const percentUsed = (spent / budgetAmount) * 100

    // Calculate daily average spending
    const dailyAverage = currentDay > 0 ? spent / currentDay : 0

    // Project spending to end of month
    const projectedSpending = dailyAverage * daysInMonth
    const projectedPercent = (projectedSpending / budgetAmount) * 100

    // Determine alert level
    let alertLevel: 'warning' | 'danger' | 'critical' | null = null
    let message = ''

    if (projectedPercent >= 100) {
      if (percentUsed >= 100) {
        alertLevel = 'critical'
        message = `Orçamento excedido! Você gastou ${percentUsed.toFixed(0)}% do seu orçamento.`
      } else if (projectedPercent >= 120) {
        alertLevel = 'critical'
        message = `Você está projetando exceder o orçamento em ${(projectedPercent - 100).toFixed(0)}%. Considere reduzir os gastos.`
      } else if (projectedPercent >= 110) {
        alertLevel = 'danger'
        message = `Projetado para exceder o orçamento em ${(projectedPercent - 100).toFixed(0)}%. Reduza os gastos.`
      } else {
        alertLevel = 'danger'
        message = `Tendência de ultrapassar o limite do orçamento. Faltam ${daysRemaining} dias.`
      }
    } else if (projectedPercent >= 85) {
      alertLevel = 'warning'
      message = `Aproximando-se do limite do orçamento. Atualmente em ${percentUsed.toFixed(0)}%, projetado ${projectedPercent.toFixed(0)}%.`
    }

    // Only include budgets with alerts
    if (alertLevel) {
      alerts.push({
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName || 'Unknown',
        budgetAmount,
        spent,
        projectedSpending,
        percentUsed,
        projectedPercent,
        daysRemaining,
        dailyAverage,
        alertLevel,
        message
      })
    }
  }

  // Sort by alert severity (critical > danger > warning)
  const severityOrder = { critical: 0, danger: 1, warning: 2 }
  alerts.sort((a, b) => severityOrder[a.alertLevel] - severityOrder[b.alertLevel])

  return alerts
})
