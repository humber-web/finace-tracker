<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  showName?: boolean
  variant?: string
  color?: string
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  showName: false,
  variant: 'ghost',
  color: 'neutral',
  size: 'sm'
})

const { user, logout } = useAuth()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Perfil',
      icon: 'i-lucide-user',
      disabled: true,
      onSelect() {
      console.log('Invite by email clicked')
    }
    },
    {
      label: 'Configurações',
      icon: 'i-lucide-settings',
      disabled: true,
      onSelect() {
        // TODO: Navigate to settings page
        console.log('Navigate to settings')
      }
    },
    {
      label: isDark.value ? 'Modo Claro' : 'Modo Escuro',
      icon: isDark.value ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect: toggleTheme
    }
  ],
  [
    {
      label: 'Sair',
      icon: 'i-lucide-log-out',
      onSelect: logout
    }
  ]
])
</script>

<template>
  <UDropdownMenu :items="items">
    <template #default="{ open }">
      <UButton
        :color="color"
        :variant="variant"
        :size="size"
      >
        <template #leading>
          <UAvatar
            :src="user?.avatar || undefined"
            :alt="user?.name || user?.email || 'User'"
            size="2xs"
          />
        </template>
        <span v-if="showName" class="truncate">
          {{ user?.name || user?.email || 'User' }}
        </span>
      </UButton>
    </template>
  </UDropdownMenu>
</template>
