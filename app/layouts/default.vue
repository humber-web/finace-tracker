<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const isSidebarOpen = ref(false)
const { user, logout } = useAuth()

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

const userMenuItems = computed(() => [
  [{
    label: user.value?.email || '',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Sair',
    icon: 'i-lucide-log-out',
    click: logout
  }]
])
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar v-model:open="isSidebarOpen" mode="slideover">
      <template #header>
        <h1 class="text-2xl font-bold wrap-normal">Gestor Financeiro</h1>
        <UColorModeSwitch  />
      </template>

      <UNavigationMenu
        :items="items"
        orientation="vertical"
      />

      <template #footer>
        <UDropdownMenu :items="userMenuItems" mode="hover">
          <template #trigger>
            <UButton
              color="neutral"
              variant="ghost"
              class="w-full"
            >
              <template #leading>
                <UAvatar
                  :src="user?.avatar || undefined"
                  :alt="user?.name || user?.email || 'User'"
                  size="xs"
                />
              </template>
              <span class="truncate">{{ user?.name || user?.email || 'User' }}</span>
            </UButton>
          </template>

          <template #account>
            <div class="text-left">
              <p class="font-medium text-sm truncate">{{ user?.name || 'User' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user?.email }}</p>
            </div>
          </template>
        </UDropdownMenu>
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
          @click="isSidebarOpen = !isSidebarOpen"
          aria-label="Abrir menu"
          class=""
          />
          <div class="w-full flex justify-between items-center">
            <h2 class="text-lg font-semibold">{{ items.find(i => i.active)?.label || 'Dashboard' }}</h2>
            <div class="flex items-center gap-2">
              <UDropdownMenu :items="userMenuItems" mode="hover">
                <template #trigger>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :ui="{ rounded: 'rounded-full' }"
                  >
                    <UAvatar
                      :src="user?.avatar || undefined"
                      :alt="user?.name || user?.email || 'User'"
                      size="2xs"
                    />
                  </UButton>
                </template>

                <template #account>
                  <div class="text-left">
                    <p class="font-medium text-sm truncate">{{ user?.name || 'User' }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user?.email }}</p>
                  </div>
                </template>
              </UDropdownMenu>
              <UColorModeSwitch  />
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
