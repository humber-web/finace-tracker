<script setup lang="ts">
import { ref, computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const currentDate = new Date()
const selectedMonth = ref(currentDate.getMonth() + 1)
const selectedYear = ref(currentDate.getFullYear())

const { data: stats } = await useFetch('/api/stats/summary', {
  query: { month: selectedMonth, year: selectedYear },
  watch: [selectedMonth, selectedYear]
})

const { data: recentTransactions } = await useFetch('/api/transactions/monthly', {
  query: { month: selectedMonth, year: selectedYear }
})

function getBadgeColor(color: string | null | undefined): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' {
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

const incomeCategories = computed(() =>
  stats.value?.categoryBreakdown?.filter(c => c.categoryType === 'income') || []
)

const expenseCategories = computed(() =>
  stats.value?.categoryBreakdown?.filter(c => c.categoryType === 'expense') || []
)

const incomeChartData = computed(() => ({
  labels: incomeCategories.value.map(c => c.categoryName),
  datasets: [{
    data: incomeCategories.value.map(c => c.total / 100),
    backgroundColor: ['#10b981', '#059669', '#14b8a6', '#84cc16']
  }]
}))

const expenseChartData = computed(() => ({
  labels: expenseCategories.value.map(c => c.categoryName),
  datasets: [{
    data: expenseCategories.value.map(c => c.total / 100),
    backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#f43f5e', '#6366f1', '#6b7280']
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('cv-CV', { style: 'currency', currency: 'CVE' }).format(amount / 100)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6 lg:space-y-8">
    <!-- Header with Month Selector -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Painel Financeiro</h1>
        <p class="mt-2 text-sm">
          Visão geral das suas finanças
        </p>
      </div>
      <DateNavigation
        :month="selectedMonth"
        :year="selectedYear"
        @update:month="selectedMonth = $event"
        @update:year="selectedYear = $event"
      />
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <UCard class="hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center justify-between p-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm uppercase tracking-wide font-medium opacity-70 mb-2">
              Total de Receitas
            </p>
            <UBadge color="success" variant="outline" size="xl" class="mb-1">
              {{ formatCurrency(stats?.income || 0) }}
            </UBadge>
           
          </div>
          <div class="shrink-0">
            <UBadge color="success" variant="outline" size="lg">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 sm:w-8 sm:h-8" />
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center justify-between p-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm uppercase tracking-wide font-medium opacity-70 mb-2">
              Total de Despesas
            </p>
             <UBadge color="error" variant="outline" size="xl" class="mb-1">
               {{ formatCurrency(stats?.expenses || 0) }}
            </UBadge>
            
          </div>
          <div class="shrink-0">
            <UBadge color="error" variant="outline" size="lg">
              <UIcon name="i-heroicons-arrow-trending-down" class="w-6 h-6 sm:w-8 sm:h-8" />
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between p-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm uppercase tracking-wide font-medium opacity-70 mb-2">
              Saldo
            </p>
            <UBadge :color="(stats?.balance || 0) >= 0 ? 'success' : 'error'" variant="outline" size="xl" class="mb-1">
               {{ formatCurrency(stats?.balance || 0) }}
            </UBadge>
          </div>
          <div class="shrink-0">
            <UBadge color="info" variant="outline" size="lg">
              <UIcon name="i-heroicons-banknotes" class="w-6 h-6 sm:w-8 sm:h-8" />
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- Income Breakdown -->
      <UCard v-if="incomeCategories.length > 0">
        <template #header>
          <h3 class="text-base sm:text-lg font-semibold">Receitas por Categoria</h3>
        </template>
        <div class="h-56 sm:h-64 md:h-72">
          <Doughnut :data="incomeChartData" :options="chartOptions" />
        </div>
      </UCard>

      <!-- Expense Breakdown -->
      <UCard v-if="expenseCategories.length > 0">
        <template #header>
          <h3 class="text-base sm:text-lg font-semibold">Despesas por Categoria</h3>
        </template>
        <div class="h-56 sm:h-64 md:h-72">
          <Doughnut :data="expenseChartData" :options="chartOptions" />
        </div>
      </UCard>
    </div>

    <!-- Recent Transactions -->
    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 class="text-base sm:text-lg font-semibold">Transações Recentes</h3>
          <UButton to="/transactions" variant="ghost" size="sm" class="w-full sm:w-auto">Ver Todas</UButton>
        </div>
      </template>

      <div v-if="!recentTransactions || recentTransactions.length === 0" class="text-center py-8">
        Nenhuma transação neste mês
      </div>

      <div v-else class="space-y-2 sm:space-y-3">
        <div
          v-for="transaction in (recentTransactions || []).slice(0, 5)"
          :key="transaction.id"
          class="flex items-center justify-between p-2 sm:p-3 rounded-lg"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div class="shrink-0">
              <UBadge
                v-if="transaction.category"
                :color="getBadgeColor(transaction.category?.color)"
                variant="outline"
              >
                <UIcon
                  :name="transaction.category?.icon || 'i-heroicons-tag'"
                  class="w-5 h-5 sm:w-6 sm:h-6"
                
                />
              </UBadge>
              <UBadge v-else color="neutral" variant="soft">
                <UIcon
                  name="i-heroicons-question-mark-circle"
                  class="w-5 h-5 sm:w-6 sm:h-6"

                />
              </UBadge>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-sm sm:text-base truncate">{{ transaction.description }}</p>
              <div class="flex items-center gap-2 text-xs sm:text-sm opacity-70">
                <span class="hidden sm:inline">{{ formatDate(transaction.date) }}</span>
                <span class="hidden sm:inline">•</span>
                <UBadge :color="getBadgeColor(transaction.category?.color)" variant="outline" size="xs" class="truncate">
                  {{ transaction.category?.name || 'Sem Categoria' }}
                </UBadge>
              </div>
            </div>
          </div>
          <p
            class="text-base sm:text-lg font-semibold shrink-0 ml-2"
            :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
