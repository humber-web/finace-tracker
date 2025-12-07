<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

type Category = {
  id: number
  name: string
  type: string
  color: string | null
  icon: string | null
  createdAt: string | Date
}

interface Props {
  categories: Category[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()

const table = useTemplateRef('table')

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

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-CV', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const columns: TableColumn<Category>[] = [{
  accessorKey: 'icon',
  header: 'Ícone',
  cell: ({ row }) => {
    const category = row.original
    const badgeColor = getBadgeColor(category.color)

    return h(UBadge, {
      color: badgeColor,
      variant: 'outline',
      size: 'lg'
    }, () => [
      h(UIcon, {
        name: category.icon || 'i-heroicons-tag',
        class: 'w-5 h-5'
      })
    ])
  }
}, {
  accessorKey: 'name',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Nome',
      icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => {
    return h('span', { class: 'font-medium' }, row.getValue('name'))
  }
}, {
  accessorKey: 'color',
  header: 'Cor',
  cell: ({ row }) => {
    const color = row.getValue('color') as string | null
    const badgeColor = getBadgeColor(color)

    return h(UBadge, {
      color: badgeColor,
      variant: 'subtle',
      size: 'sm'
    }, () => color || 'gray')
  }
}, {
  accessorKey: 'createdAt',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Data de Criação',
      icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => {
    return formatDate(row.getValue('createdAt'))
  }
}, {
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
    const items = [{
      label: 'Editar',
      icon: 'i-heroicons-pencil-square',
      onSelect() {
        emit('edit', row.original)
      }
    }, {
      label: 'Excluir',
      icon: 'i-heroicons-trash',
      onSelect() {
        emit('delete', row.original)
      }
    }]

    return h('div', { class: 'text-right' }, h(UDropdownMenu, {
      'content': {
        align: 'end'
      },
      items,
      'aria-label': 'Actions dropdown'
    }, () => h(UButton, {
      'icon': 'i-heroicons-ellipsis-vertical',
      'color': 'neutral',
      'variant': 'ghost',
      'class': 'ml-auto',
      'aria-label': 'Actions dropdown'
    })))
  }
}]
</script>

<template>
  <div class="overflow-x-auto -mx-4 sm:mx-0">
    <UTable
      ref="table"
      :data="categories"
      :columns="columns"
    />
  </div>
</template>
