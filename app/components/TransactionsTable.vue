<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

type Transaction = {
  id: number
  description: string
  amount: number
  date: string
  month: number
  year: number
  type: string
  category: {
    id: number
    name: string
    type: string
    color: string | null
    icon: string | null
  } | null
}

interface Props {
  transactions: Transaction[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  delete: [ids: number[]]
  edit: [id: number]
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-CV', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  const formatted = new Intl.NumberFormat('pt-CV', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100)
  return `${formatted} CVE`
}

const columns: TableColumn<Transaction>[] = [{
  id: 'select',
  header: ({ table }) => h(UCheckbox, {
    'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
    'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
    'aria-label': 'Select all'
  }),
  cell: ({ row }) => h(UCheckbox, {
    'modelValue': row.getIsSelected(),
    'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
    'aria-label': 'Select row'
  }),
  enableSorting: false,
  enableHiding: false
}, {
  accessorKey: 'date',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label:  'Data',
      icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => {
    return formatDate(row.getValue('date'))
  }
}, {
  accessorKey: 'description',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Descrição',
      icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  }
}, {
  accessorKey: 'category',
  header: 'Categoria',
  cell: ({ row }) => {
    const category = row.getValue('category') as Transaction['category']

    if (!category) {
      return h(UBadge, {
        color: 'neutral',
        variant: 'subtle'
      }, () => 'Sem Categoria')
    }

    const badgeColor = getBadgeColor(category.color)
    return h('div', { class: 'flex items-center gap-2' }, [
      h(UBadge, {
        color: badgeColor,
        variant: 'outline'
      }, () => [
        h(UIcon, {
          name: category.icon || 'i-heroicons-tag',
          class: 'w-4 h-4'
        })
      ]),
      h('span', { class: 'font-medium text-sm' }, category.name)
    ])
  }
}, {
  accessorKey: 'type',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Tipo',
      icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => {
    const type = row.getValue('type') as string
    return h(UBadge, {
      color: type === 'income' ? 'success' : 'error',
      variant: 'subtle'
    }, () => type.charAt(0).toUpperCase() + type.slice(1))
  }
}, {
  accessorKey: 'amount',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h('div', { class: 'flex items-center justify-end gap-2' }, [
      h('span', {}, 'Valor'),
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: isSorted ? (isSorted === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down') : 'i-heroicons-arrows-up-down',
        size: 'xs',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    ])
  },
  cell: ({ row }) => {
    const amount = row.getValue('amount') as number
    const type = row.original.type
    const formatted = formatCurrency(amount)
    const sign = type === 'expense' ? '-' : '+'

    return h(UBadge, {
      color: type === 'expense' ? 'error' : 'success',
      variant: 'subtle',
      class: 'font-medium'
    }, () => `${sign} ${formatted}`)
  }
}, {
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
    const items = [{
      label: 'Editar',
      icon: 'i-heroicons-pencil-square',
      onSelect() {
        emit('edit', row.original.id)
      }
    }, {
      label: 'Excluir',
      icon: 'i-heroicons-trash',
      onSelect() {
        emit('delete', [row.original.id])
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

function handleDeleteSelected() {
  const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
  const ids = selectedRows.map(row => row.original.id)
  if (ids.length > 0) {
    emit('delete', ids)
  }
}
</script>

<template>
  <div class="space-y-3 sm:space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <UInput
        :model-value="(table?.tableApi?.getColumn('description')?.getFilterValue() as string)"
        class="w-full sm:max-w-sm"
        placeholder="Buscar transações..."
        @update:model-value="table?.tableApi?.getColumn('description')?.setFilterValue($event)"
      />

      <UButton
        v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
        color="error"
        variant="outline"
        icon="i-heroicons-trash"
        class="w-full sm:w-auto"
        @click="handleDeleteSelected"
      >
        <span class="sm:hidden">Excluir ({{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }})</span>
        <span class="hidden sm:inline">Excluir {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} selecionada(s)</span>
      </UButton>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto -mx-4 sm:mx-0">
      <UTable
        ref="table"
        :data="transactions"
        :columns="columns"
      />
    </div>

    <!-- Footer -->
    <div class="text-xs sm:text-sm opacity-70">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} linha(s) selecionada(s).
    </div>
  </div>
</template>
