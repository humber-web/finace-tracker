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
    <form @submit.prevent="onSubmit" class="space-y-5">
        <!-- Category Name -->
        <UFormField
          label="Nome da Categoria"
          help="Digite o nome da categoria."
          required
        >
          <UInput
            v-model="name"
            placeholder="ex: Alimentação, Salário"
            size="md"
            class="w-full"
          />
        </UFormField>

        <!-- Color Selection -->
        <UFormField
          label="Cor"
          help="Selecione uma cor para identificar a categoria."
        >
          <div class="grid grid-cols-4 gap-2">
            <UButton
              v-for="option in colorOptions"
              :key="option.value"
              @click="color = option.value"
              :variant="color === option.value ? 'solid' : 'outline'"
              :color="color === option.value ? 'primary' : 'neutral'"
              size="sm"
              class="justify-start"
            >
              <template #leading>
                <span
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: getColorValue(option.value, '500') }"
                ></span>
              </template>
              {{ option.label }}
            </UButton>
          </div>
        </UFormField>

        <!-- Icon Selection -->
        <UFormField
          label="Ícone"
          help="Escolha um ícone da galeria ou digite um personalizado."
        >
          <UContainer class="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto p-2  rounded-lg">
            <UButton
              v-for="option in iconOptions"
              :key="option.name"
              @click="icon = option.name"
              :variant="icon === option.name ? 'solid' : 'outline'"
              :color="icon === option.name ? 'primary' : 'neutral'"
              size="sm"
              class="flex-col h-auto py-2 px-1"
              :title="option.label"
            >
              <UIcon :name="option.name" class="w-6 h-6" />
              <span class="text-[10px] text-center leading-tight mt-1">{{ option.label }}</span>
            </UButton>
          </UContainer>
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
        </UFormField>
      </form>
</template>
