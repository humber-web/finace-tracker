<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  categories: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: { categoryId: number; amount: number }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedCategory = ref<any>(null)
const amount = ref(0)

const formattedCategories = computed(() => {
  return props.categories.map(cat => ({
    id: cat.id,
    label: cat.name,
    icon: cat.icon || 'i-heroicons-tag',
    color: cat.color,
    value: cat.id
  }))
})

function onSubmit() {
  if (!selectedCategory.value || !amount.value) return

  emit('submit', {
    categoryId: selectedCategory.value.id,
    amount: Math.round(amount.value * 100)
  })
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
      <!-- Category Selection -->
      <div>
        <label class="block text-sm font-medium mb-2">Categoria *</label>
        <USelectMenu
          v-model="selectedCategory"
          :items="formattedCategories"
          placeholder="Selecione uma categoria"
          searchable
          searchable-placeholder="Buscar categoria..."
          value-attribute="id"
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
        <p v-if="categories.length === 0" class="text-xs text-gray-500 mt-1">
          Nenhuma categoria de despesa disponível. Crie categorias primeiro.
        </p>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium mb-2">Valor do Orçamento *</label>
        <UInput
          v-model="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          icon="i-heroicons-currency-dollar"
          required
          class="w-full"
        />
        <p class="text-xs text-gray-500 mt-1">
          Defina o valor máximo que deseja gastar nesta categoria este mês
        </p>
      </div>
    </form>
</template>
