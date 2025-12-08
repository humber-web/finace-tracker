<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import type { RadioGroupItem } from '@nuxt/ui'
import { CalendarDate, parseDate, today, getLocalTimeZone } from '@internationalized/date'

const radioItems = computed<RadioGroupItem[]>(() => [
  {
    label: 'Despesa',
    value: 'expense',
    description: 'Transações recorrentes que representam gastos.'
  },
  {
    label: 'Receita',
    value: 'income',
    description: 'Transações recorrentes que representam ganhos.'
  },
])

interface Props {
  modelValue: boolean
  recurring?: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const state = reactive({
  amount: 0,
  description: '',
  type: 'expense' as 'income' | 'expense',
  categoryId: undefined as number | undefined,
  frequency: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: ''
})

const startCalendarDate = ref<CalendarDate>(today(getLocalTimeZone()))
const endCalendarDate = ref<CalendarDate | null>(null)

// Sync calendar dates with state
watch(startCalendarDate, (newDate) => {
  if (newDate) {
    state.startDate = `${newDate.year}-${String(newDate.month).padStart(2, '0')}-${String(newDate.day).padStart(2, '0')}`
  }
})

watch(endCalendarDate, (newDate) => {
  if (newDate) {
    state.endDate = `${newDate.year}-${String(newDate.month).padStart(2, '0')}-${String(newDate.day).padStart(2, '0')}`
  } else {
    state.endDate = ''
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

const frequencyOptions = [
  { label: 'Diária', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
  { label: 'Anual', value: 'yearly' }
]

// Watch for category type change
watch(() => state.type, () => {
  state.categoryId = undefined
})

// Populate form when editing or when modal opens
watch([() => props.modelValue, () => props.recurring], ([isOpen, recurring]) => {
  if (isOpen) {
    if (recurring) {
      state.amount = recurring.amount / 100
      state.description = recurring.description
      state.type = recurring.type
      state.categoryId = recurring.categoryId
      state.frequency = recurring.frequency
      state.startDate = new Date(recurring.startDate).toISOString().split('T')[0]
      startCalendarDate.value = parseDate(state.startDate)

      if (recurring.endDate) {
        state.endDate = new Date(recurring.endDate).toISOString().split('T')[0]
        endCalendarDate.value = parseDate(state.endDate)
      } else {
        state.endDate = ''
        endCalendarDate.value = null
      }
    } else {
      state.amount = 0
      state.description = ''
      state.type = 'expense'
      state.categoryId = undefined
      state.frequency = 'monthly'
      state.startDate = new Date().toISOString().split('T')[0]
      state.endDate = ''
      startCalendarDate.value = today(getLocalTimeZone())
      endCalendarDate.value = null
    }
  }
}, { immediate: true })

function onSubmit() {
  emit('submit', {
    amount: Math.round(state.amount * 100),
    description: state.description,
    type: state.type,
    categoryId: state.categoryId || null,
    frequency: state.frequency,
    startDate: state.startDate,
    endDate: state.endDate || null
  })
}

defineExpose({
  submit: onSubmit
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
      <UFormField
        label="Valor"
        help="Insira o valor da transação recorrente."
        required
      >
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
      </UFormField>

      <!-- Description -->
      <UFormField
        label="Descrição"
        :help="`${state.description.length}/100 caracteres`"
        required
      >
        <UInput
          v-model="state.description"
          placeholder="ex: Aluguel mensal"
          size="md"
          maxlength="100"
          class="w-full"
        />
      </UFormField>

      <!-- Frequency -->
      <UFormField
        label="Frequência"
        help="Selecione com que frequência a transação se repete."
        required
      >
        <UButtonGroup orientation="horizontal" class="w-full flex gap-2">
          <UButton
            v-for="option in frequencyOptions"
            :key="option.value"
            :label="option.label"
            :variant="state.frequency === option.value ? 'solid' : 'outline'"
            :color="state.frequency === option.value ? 'primary' : 'neutral'"
            @click="state.frequency = option.value"
            class="flex-1"
          />
        </UButtonGroup>
      </UFormField>

      <!-- Start Date -->
      <UFormField
        label="Data de Início"
        required
      >
        <div class="flex items-center gap-2">
          <UInput
            :value="startCalendarDate ? `${startCalendarDate.day}/${startCalendarDate.month}/${startCalendarDate.year}` : ''"
            disabled
            size="md"
            class="flex-1"
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
              <UCalendar v-model="startCalendarDate" class="p-2" />
            </template>
          </UPopover>
        </div>
      </UFormField>

      <!-- End Date (Optional) -->
      <UFormField
        label="Data de Término (Opcional)"
        help="Deixe vazio para recorrência sem data final."
      >
        <div class="flex items-center gap-2">
          <UInput
            :value="endCalendarDate ? `${endCalendarDate.day}/${endCalendarDate.month}/${endCalendarDate.year}` : 'Sem data final'"
            disabled
            size="md"
            class="flex-1"
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
              <UCalendar v-model="endCalendarDate" class="p-2" />
            </template>
          </UPopover>
          <UButton
            v-if="endCalendarDate"
            color="warning"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="endCalendarDate = null"
            aria-label="Limpar data"
          />
        </div>
      </UFormField>
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
