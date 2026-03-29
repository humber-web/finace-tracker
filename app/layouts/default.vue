<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { SpeedInsights } from '@vercel/speed-insights/vue'


const route = useRoute()
const isSidebarOpen = ref(false)

// Close sidebar when route changes
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

const items = computed((): NavigationMenuItem[] => [{
  label: 'Painel',
  icon: 'i-lucide-house',
  to: '/dashboard',
  active: route.path === '/dashboard'
}, {
  label: 'Transações',
  icon: 'i-lucide-inbox',
  to: '/transactions',
  active: route.path === '/transactions'
}, {
  label: 'Recorrentes',
  icon: 'i-lucide-users',
  to: '/recurring',
  active: route.path === '/recurring'
}, {
  label: 'Orçamentos',
  icon: 'i-lucide-bar-chart-2',
  to: '/budgets',
  active: route.path === '/budgets'
}, {
  label: 'Análises',
  icon: 'i-lucide-pie-chart',
  to: '/analytics',
  active: route.path === '/analytics'
}, {
  label: 'Categorias',
  icon: 'i-lucide-tag',
  to: '/categories',
  active: route.path === '/categories'
}])

</script>

<template>
  <SpeedInsights />
  <UDashboardGroup>
    <UDashboardSidebar v-model:open="isSidebarOpen" mode="slideover">
      <template #header>
        <h1 class="text-2xl font-bold wrap-normal">Gestor Financeiro</h1>
      </template>

      <UNavigationMenu
        :items="items"
        orientation="vertical"
      />

      <template #footer>
        <UserMenu
          size="md"
          avatar-size="xs"
          show-name
          button-class="w-full"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel grow>
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-3 px-4 py-3 border-b lg:hidden">
          <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          size="lg"
          @click.stop="isSidebarOpen = true"
          aria-label="Abrir menu"
          />
          <div class="w-full flex justify-between items-center">
            <h2 class="text-lg font-semibold">{{ items.find(i => i.active)?.label || 'Dashboard' }}</h2>
            <div class="flex items-center gap-2">
              <UserMenu
                button-class="rounded-full"
              />
            </div>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          <!-- <UColorModeSwitch  /> -->
          <slot />
        </div>
      </div>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
