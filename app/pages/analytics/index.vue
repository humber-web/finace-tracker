<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const df = new DateFormatter('pt-CV', {
  dateStyle: 'medium'
})

// Date range using CalendarDate
const now = new Date()
const dateRange = ref({
  start: new CalendarDate(now.getFullYear(), now.getMonth() - 4, 1),
  end: new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
})

// Convert CalendarDate to ISO string for API
const startDate = computed(() => {
  const date = dateRange.value.start.toDate(getLocalTimeZone())
  return date.toISOString().split('T')[0]
})

const endDate = computed(() => {
  const date = dateRange.value.end.toDate(getLocalTimeZone())
  return date.toISOString().split('T')[0]
})

const groupBy = ref('month')

const { data: trendsData } = await useFetch('/api/analytics/trends', {
  query: { startDate, endDate, groupBy },
  watch: [startDate, endDate, groupBy]
})

// Fetch categories to determine types
const { data: allCategories } = await useFetch('/api/categories')

const groupByOptions = [
  { label: 'Diário', value: 'day' },
  { label: 'Semanal', value: 'week' },
  { label: 'Mensal', value: 'month' }
]

// Income vs Expense chart data
const incomeExpenseChart = computed(() => {
  if (!trendsData.value?.trends) return null

  return {
    labels: trendsData.value.trends.map(t => formatPeriodLabel(t.period)),
    datasets: [
      {
        label: 'Receitas',
        data: trendsData.value.trends.map(t => t.income / 100),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      },
      {
        label: 'Despesas',
        data: trendsData.value.trends.map(t => t.expense / 100),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2
      }
    ]
  }
})

// Net income trend chart data
const netIncomeChart = computed(() => {
  if (!trendsData.value?.trends) return null

  const data = trendsData.value.trends.map(t => t.net / 100)
  const hasNegative = data.some(v => v < 0)

  return {
    labels: trendsData.value.trends.map(t => formatPeriodLabel(t.period)),
    datasets: [
      {
        label: 'Receita Líquida',
        data,
        backgroundColor: hasNegative ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
        borderColor: hasNegative ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  }
})

// Top categories with type information
const topCategories = computed(() => {
  if (!trendsData.value?.trends || !allCategories.value) return []

  const categoryTotals: Record<string, { name: string; amount: number; color: string | null; type: string }> = {}

  // Collect all category totals
  for (const trend of trendsData.value.trends) {
    for (const [categoryId, data] of Object.entries(trend.categoryBreakdown)) {
      if (!categoryTotals[categoryId]) {
        // Find the category type from the categories list
        const category = allCategories.value.find((c: any) => c.id === parseInt(categoryId))
        categoryTotals[categoryId] = {
          name: data.name,
          amount: 0,
          color: data.color,
          type: category?.type || 'expense'
        }
      }
      categoryTotals[categoryId].amount += data.amount
    }
  }

  return Object.entries(categoryTotals)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
})

function formatPeriodLabel(period: string): string {
  if (groupBy.value === 'day') {
    return new Date(period).toLocaleDateString('pt-CV', { month: 'short', day: 'numeric' })
  } else if (groupBy.value === 'week') {
    return `Semana de ${new Date(period).toLocaleDateString('pt-CV', { month: 'short', day: 'numeric' })}`
  } else {
    const [year = '', month = ''] = period.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-CV', { month: 'short', year: 'numeric' })
  }
}

function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat('pt-CV', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100)
  return `${formatted} CVE`
}

function setQuickRange(months: number) {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth() - months, 1)
  dateRange.value = {
    start: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
    end: new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate())
  }
}

function getBadgeColor(color: string | null): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    green: 'success',
    emerald: 'success',
    red: 'error',
    rose: 'error',
    blue: 'primary',
    indigo: 'primary',
    yellow: 'warning',
    purple: 'secondary',
    pink: 'secondary',
    gray: 'neutral',
    teal: 'info',
    lime: 'success'
  }
  return colorMap[color || 'gray'] || 'neutral'
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => value.toLocaleString('pt-CV') + ' CVE'
      }
    }
  }
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold">Análises</h2>
      <p class="text-sm opacity-70 mt-1">
        Analise seus padrões de gastos e tendências
      </p>
    </div>

    <!-- Date Range Selector -->
    <UCard>
      <template #header>
        <h3 class="text-base sm:text-lg font-semibold">Período de Data</h3>
      </template>

      <div class="space-y-4">
        <!-- Quick Range Buttons -->
        <div class="grid grid-cols-2 sm:flex gap-2">
          <UButton variant="outline" size="sm" class="w-full sm:w-auto" @click="setQuickRange(2)">
            <span class="sm:hidden">3 Meses</span>
            <span class="hidden sm:inline">Últimos 3 Meses</span>
          </UButton>
          <UButton variant="outline" size="sm" class="w-full sm:w-auto" @click="setQuickRange(5)">
            <span class="sm:hidden">6 Meses</span>
            <span class="hidden sm:inline">Últimos 6 Meses</span>
          </UButton>
          <UButton variant="outline" size="sm" class="w-full sm:w-auto" @click="setQuickRange(11)">
            <span class="sm:hidden">1 Ano</span>
            <span class="hidden sm:inline">Último Ano</span>
          </UButton>
          <UButton variant="outline" size="sm" class="w-full sm:w-auto" @click="setQuickRange(23)">
            <span class="sm:hidden">2 Anos</span>
            <span class="hidden sm:inline">Últimos 2 Anos</span>
          </UButton>
        </div>

        <!-- Custom Date Range -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Selecionar Período</label>
            <UPopover>
              <UButton color="neutral" variant="outline" icon="i-heroicons-calendar" class="w-full justify-start">
                <template v-if="dateRange.start">
                  <template v-if="dateRange.end">
                    <span class="text-xs sm:text-sm">
                      {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} - {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}
                    </span>
                  </template>
                  <template v-else>
                    {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}
                  </template>
                </template>
                <template v-else>
                  Escolher período
                </template>
              </UButton>

              <template #content>
                <UCalendar v-model="dateRange" class="p-2" :number-of-months="2" range />
              </template>
            </UPopover>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Agrupar Por</label>
            <div class="grid grid-cols-3 gap-1">
              <UButton
                v-for="option in groupByOptions"
                :key="option.value"
                @click="groupBy = option.value"
                :variant="groupBy === option.value ? 'solid' : 'outline'"
                :color="groupBy === option.value ? 'primary' : 'neutral'"
                size="sm"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Summary Stats -->
    <div v-if="trendsData?.summary" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <UCard>
        <div class="text-center p-2">
          <p class="text-xs sm:text-sm opacity-70 mb-2">Receitas Totais</p>
          <UBadge color="success" variant="outline" size="lg" class="text-base sm:text-xl font-bold">
            {{ formatCurrency(trendsData.summary.totalIncome) }}
          </UBadge>
        </div>
      </UCard>
      <UCard>
        <div class="text-center p-2">
          <p class="text-xs sm:text-sm opacity-70 mb-2">Despesas Totais</p>
          <UBadge color="error" variant="outline" size="lg" class="text-base sm:text-xl font-bold">
            {{ formatCurrency(trendsData.summary.totalExpense) }}
          </UBadge>
        </div>
      </UCard>
      <UCard>
        <div class="text-center p-2">
          <p class="text-xs sm:text-sm opacity-70 mb-2">Receita Líquida</p>
          <UBadge
            :color="trendsData.summary.netIncome >= 0 ? 'success' : 'error'"
            variant="outline"
            size="lg"
            class="text-base sm:text-xl font-bold"
          >
            {{ formatCurrency(trendsData.summary.netIncome) }}
          </UBadge>
        </div>
      </UCard>
      <UCard>
        <div class="text-center p-2">
          <p class="text-xs sm:text-sm opacity-70 mb-2">Transações</p>
          <p class="text-xl sm:text-2xl font-bold">
            {{ trendsData.summary.totalTransactions }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Income vs Expense -->
      <UCard>
        <template #header>
          <h3 class="text-base sm:text-lg font-semibold">Receitas vs Despesas</h3>
        </template>
        <div class="h-64 sm:h-80">
          <Bar v-if="incomeExpenseChart" :data="incomeExpenseChart" :options="chartOptions" />
        </div>
      </UCard>

      <!-- Net Income Trend -->
      <UCard>
        <template #header>
          <h3 class="text-base sm:text-lg font-semibold">Tendência de Receita Líquida</h3>
        </template>
        <div class="h-64 sm:h-80">
          <Line v-if="netIncomeChart" :data="netIncomeChart" :options="chartOptions" />
        </div>
      </UCard>
    </div>

    <!-- Top Categories -->
    <UCard>
      <template #header>
        <h3 class="text-base sm:text-lg font-semibold">Principais Categorias</h3>
      </template>

      <div class="space-y-2 sm:space-y-3">
        <div
          v-for="(category, index) in topCategories"
          :key="category.id"
          class="flex items-center gap-2 sm:gap-4 p-2 sm:p-0"
        >
          <div class="opacity-70 w-5 sm:w-6 text-center font-semibold text-sm">
            {{ index + 1 }}
          </div>
          <UBadge
            :color="getBadgeColor(category.color)"
            variant="outline"
            size="sm"
          >
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: category.color || '#6b7280' }"></div>
          </UBadge>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm sm:text-base truncate">{{ category.name }}</p>
          </div>
          <div class="text-right">
            <UBadge
              :color="category.type === 'income' ? 'success' : 'error'"
              variant="outline"
              class="font-semibold text-xs sm:text-sm"
            >
              {{ formatCurrency(category.amount) }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
