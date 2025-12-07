<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  categoryType: 'income' | 'expense'
  category?: {
    id: number
    name: string
    type: 'income' | 'expense'
    color: string | null
    icon: string | null
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: { name: string; type: 'income' | 'expense'; color: string; icon: string }]
}>()

const name = ref('')
const color = ref('gray')
const icon = ref('i-heroicons-tag')

const colorOptions = [
  { label: 'Vermelho', value: 'red' },
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Amarelo', value: 'yellow' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Índigo', value: 'indigo' },
  { label: 'Cinza', value: 'gray' }
]

const iconOptions = [
  // Compras & Alimentação
  { name: 'i-heroicons-shopping-bag', label: 'Compras' },
  { name: 'i-heroicons-shopping-cart', label: 'Carrinho' },
  { name: 'i-lucide-utensils', label: 'Restaurante' },
  { name: 'i-lucide-coffee', label: 'Café' },
  { name: 'i-lucide-pizza', label: 'Fast Food' },

  // Transporte
  { name: 'i-lucide-car', label: 'Carro' },
  { name: 'i-lucide-bus', label: 'Transporte' },
  { name: 'i-lucide-plane', label: 'Viagem' },
  { name: 'i-lucide-fuel', label: 'Combustível' },

  // Casa & Serviços
  { name: 'i-heroicons-home', label: 'Casa' },
  { name: 'i-lucide-lightbulb', label: 'Energia' },
  { name: 'i-lucide-droplet', label: 'Água' },
  { name: 'i-lucide-wifi', label: 'Internet' },
  { name: 'i-lucide-smartphone', label: 'Celular' },

  // Saúde & Bem-estar
  { name: 'i-lucide-heart-pulse', label: 'Saúde' },
  { name: 'i-lucide-pill', label: 'Farmácia' },
  { name: 'i-lucide-dumbbell', label: 'Academia' },

  // Entretenimento
  { name: 'i-lucide-film', label: 'Cinema' },
  { name: 'i-lucide-gamepad-2', label: 'Jogos' },
  { name: 'i-lucide-music', label: 'Música' },
  { name: 'i-heroicons-tv', label: 'TV' },

  // Educação & Trabalho
  { name: 'i-heroicons-academic-cap', label: 'Educação' },
  { name: 'i-heroicons-book-open', label: 'Livros' },
  { name: 'i-heroicons-briefcase', label: 'Trabalho' },

  // Finanças & Receitas
  { name: 'i-heroicons-banknotes', label: 'Dinheiro' },
  { name: 'i-heroicons-currency-dollar', label: 'Salário' },
  { name: 'i-lucide-trending-up', label: 'Investimento' },
  { name: 'i-lucide-piggy-bank', label: 'Poupança' },
  { name: 'i-heroicons-gift', label: 'Presente' },

  // Outros
  { name: 'i-heroicons-tag', label: 'Tag' },
  { name: 'i-lucide-shirt', label: 'Roupa' },
  { name: 'i-lucide-paw-print', label: 'Pet' },
  { name: 'i-lucide-hammer', label: 'Reparos' },
  { name: 'i-lucide-sparkles', label: 'Beleza' },
]

// Computed for v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Reset or populate form when modal opens or category changes
watch([() => props.modelValue, () => props.category, () => props.mode], ([isOpen, category, mode]) => {
  if (isOpen) {
    if (mode === 'edit' && category) {
      name.value = category.name
      color.value = category.color || 'gray'
      icon.value = category.icon || 'i-heroicons-tag'
    } else {
      name.value = ''
      color.value = 'gray'
      icon.value = 'i-heroicons-tag'
    }
  }
}, { immediate: true })

// Helper function to get Tailwind color values
function getColorValue(colorName: string, shade: string) {
  const colors: Record<string, Record<string, string>> = {
    red: { '100': '#fee2e2', '500': '#ef4444', '800': '#991b1b' },
    blue: { '100': '#dbeafe', '500': '#3b82f6', '800': '#1e40af' },
    green: { '100': '#dcfce7', '500': '#22c55e', '800': '#166534' },
    yellow: { '100': '#fef3c7', '500': '#eab308', '800': '#854d0e' },
    purple: { '100': '#f3e8ff', '500': '#a855f7', '800': '#6b21a8' },
    pink: { '100': '#fce7f3', '500': '#ec4899', '800': '#9f1239' },
    indigo: { '100': '#e0e7ff', '500': '#6366f1', '800': '#3730a3' },
    gray: { '100': '#f3f4f6', '500': '#6b7280', '800': '#1f2937' }
  }
  return colors[colorName]?.[shade] || colors.gray[shade]
}

function onSubmit() {
  emit('submit', {
    name: name.value,
    type: props.categoryType,
    color: color.value,
    icon: icon.value
  })
  emit('update:modelValue', false)
}

function closeModal() {
  emit('update:modelValue', false)
}

defineExpose({
  onSubmit
})
</script>

<template>
    <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Nome da Categoria*</label>
          <UInput v-model="name" placeholder="e.g., Groceries, Salary" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Cor</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              type="button"
              @click="color = option.value"
              :class="[
                'px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                color === option.value
                  ? 'border-gray-900 dark:border-white shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              ]"
              :style="{
                backgroundColor: color === option.value ? getColorValue(option.value, '100') : 'transparent',
                color: color === option.value ? getColorValue(option.value, '800') : 'currentColor'
              }"
            >
              <span class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: getColorValue(option.value, '500') }"
                ></span>
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Ícone</label>
          <div class="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              v-for="option in iconOptions"
              :key="option.name"
              type="button"
              @click="icon = option.name"
              :class="[
                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                icon === option.name
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              :title="option.label"
            >
              <UIcon :name="option.name" class="w-6 h-6" />
              <span class="text-[10px] text-center leading-tight">{{ option.label }}</span>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Selecione um ícone ou use um personalizado</p>
          <UInput
            v-model="icon"
            placeholder="i-heroicons-tag"
            size="sm"
            class="mt-2"
          >
            <template #trailing v-if="icon">
              <UIcon :name="icon" class="w-4 h-4" />
            </template>
          </UInput>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          
        </div>
      </form>
</template>
