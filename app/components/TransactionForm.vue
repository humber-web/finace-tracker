<script setup lang="ts">
import { reactive, computed, watch, shallowRef } from 'vue'
import { useFetch } from '#app'
import { CalendarDate, parseDate, today, getLocalTimeZone } from '@internationalized/date'
import type { RadioGroupItem } from '@nuxt/ui'

const radioItems = computed<RadioGroupItem[]>(() => [
  {
    label: 'Despesa',
    value: 'expense',
    description: 'Transações que representam gastos ou saídas de dinheiro.'
  },
  {
    label: 'Receita',
    value: 'income',
    description: 'Transações que representam ganhos ou entradas de dinheiro.'
  },
])

interface Props {
  initialData?: {
    amount: number
    description: string
    date: string
    type: 'income' | 'expense'
    categoryId?: number
  }
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Salvar Transação'
})

const emit = defineEmits<{
  submit: [data: {
    amount: number
    description: string
    date: string
    type: 'income' | 'expense'
    categoryId?: number
  }]
  cancel: []
}>()

const state = reactive({
  amount: props.initialData?.amount ? props.initialData.amount / 100 : 0,
  description: props.initialData?.description || '',
  date: props.initialData?.date
    ? new Date(props.initialData.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  type: (props.initialData?.type || 'expense') as 'income' | 'expense',
  categoryId: props.initialData?.categoryId || undefined
})

// Initialize calendar date from state.date
const calendarDate = shallowRef<CalendarDate>(
  props.initialData?.date
    ? parseDate(new Date(props.initialData.date).toISOString().split('T')[0])
    : today(getLocalTimeZone())
)

// Sync calendar date with state.date
watch(calendarDate, (newDate) => {
  if (newDate) {
    state.date = `${newDate.year}-${String(newDate.month).padStart(2, '0')}-${String(newDate.day).padStart(2, '0')}`
  }
})

const { data: categories } = useFetch('/api/categories')

const filteredCategories = computed(() => {
  return categories.value?.filter(c => c.type === state.type).map(c => ({
    label: c.name,
    value: c.id,
    icon: c.icon || 'i-heroicons-tag',
    color: c.color || 'gray'
  })) || []
})

const selectedCategory = computed({
  get: () => filteredCategories.value.find(c => c.value === state.categoryId),
  set: (val) => {
    state.categoryId = val?.value
  }
})

// Reset category when type changes
watch(() => state.type, () => {
  state.categoryId = undefined
})

// Add validation state tracking
const errors = reactive({
  amount: '',
  description: '',
  date: ''
})

function validateForm() {
  errors.amount = !state.amount ? 'Valor obrigatório' : ''
  errors.description = !state.description ? 'Descrição obrigatória' : ''
  errors.date = !state.date ? 'Data obrigatória' : ''

  return !errors.amount && !errors.description && !errors.date
}

function onSubmit() {
  if (!validateForm()) return

  emit('submit', {
    ...state,
    date: state.date as string,
    amount: Math.round(state.amount * 100)
  })
}

// Expose method for parent to call
defineExpose({
  submit: onSubmit,
  isValid: () => {
    validateForm()
    return !errors.amount && !errors.description && !errors.date
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="w-full">
    <!-- Type Selector Section -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Tipo de Transação <span class="text-red-500">*</span>
      </label>
      <URadioGroup
        v-model="state.type"
        :color="state.type === 'expense' ? 'error' : 'success'"
        variant="table"
        :items="radioItems"
      />
    </div>

    <!-- Main Form Fields -->
    <div class="space-y-5 mb-6">
      <!-- Amount -->
      <div>
        <UFormGroup
          label="Valor"
          required
          class="space-y-2"
        >
          <template #label>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Valor <span class="text-red-500">*</span>
              <span v-if="errors.amount" class="text-red-500 text-xs font-normal">
                - {{ errors.amount }}
              </span>
            </span>
          </template>
          <UInput
            v-model="state.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            icon="i-heroicons-currency-dollar"
            size="md"
            class="w-full"
          />
        </UFormGroup>
      </div>

      <!-- Description -->
      <div>
        <UFormGroup
          label="Descrição"
          required
          class="space-y-2"
        >
          <template #label>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Descrição <span class="text-red-500">*</span>
              <span v-if="errors.description" class="text-red-500 text-xs font-normal">
                - {{ errors.description }}
              </span>
            </span>
          </template>
          <UInput
            v-model="state.description"
            placeholder="ex: Compras no supermercado"
            size="md"
            class="w-full"
            maxlength="100"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 text-right">
            {{ state.description.length }}/100
          </p>
        </UFormGroup>
      </div>

      <!-- Date -->
      <div>
        <UFormGroup
          label="Data"
          required
          class="space-y-2"
        >
          <template #label>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Data <span class="text-red-500">*</span>
              <span v-if="errors.date" class="text-red-500 text-xs font-normal">
                - {{ errors.date }}
              </span>
            </span>
          </template>
          <div class="flex items-center gap-2">
            <UInput
              :value="calendarDate ? `${calendarDate.day}/${calendarDate.month}/${calendarDate.year}` : ''"
              disabled
              size="md"
              class="w-full"
            />
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Selecione uma data"
              />

              <template #content>
                <UCalendar v-model="calendarDate" class="p-2" />
              </template>
            </UPopover>
          </div>
        </UFormGroup>
      </div>
    </div>

    <!-- Category Section -->
    <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Categoria <span class="text-xs text-gray-500 dark:text-gray-400">(Opcional)</span>
      </label>

      <div v-if="filteredCategories.length > 0" class="space-y-4">
        <USelectMenu
          v-model="selectedCategory"
          :items="filteredCategories"
          placeholder="Selecione uma categoria"
          searchable
          searchable-placeholder="Buscar categoria..."
          class="w-full"
        >
          <template #leading>
            <UIcon
              v-if="selectedCategory"
              :name="selectedCategory.icon"
              class="w-5 h-5"
            />
            <UIcon
              v-else
              name="i-heroicons-tag"
              class="w-5 h-5 text-gray-400"
            />
          </template>

          <template #item="{ item }">
            <div class="flex items-center gap-2 w-full">
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span class="truncate">{{ item.label }}</span>
            </div>
          </template>
        </USelectMenu>

        <UButton
          v-if="state.categoryId"
          variant="ghost"
          color="warning"
          size="sm"
          @click="state.categoryId = undefined"
          icon="i-heroicons-x-mark"
          class="w-full"
        >
          Limpar Categoria
        </UButton>
      </div>

      <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div class="text-center">
          <UIcon name="i-heroicons-tag" class="w-8 h-8 mx-auto text-gray-400 mb-3" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Nenhuma categoria de {{ state.type === 'income' ? 'receita' : 'despesa' }} ainda
          </p>
          <NuxtLink to="/categories">
            <UButton size="sm" icon="i-heroicons-plus">
              Criar Categoria
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

  </form>
</template>
