<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  category: {
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
  'confirm': []
}>()

// Computed for v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function closeModal() {
  emit('update:modelValue', false)
}
</script>

<template>
    <div class="space-y-4">
      <div v-if="category" class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <UIcon :name="category.icon || 'i-heroicons-tag'" class="w-6 h-6" />
          <div>
            <p class="font-semibold">{{ category.name }}</p>
            <p class="text-sm text-gray-500">{{ category.type }} categoria</p>
          </div>
        </div>
      </div>

      <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Atenção:</strong> Esta ação não pode ser desfeita. As transações com esta categoria permanecerão, mas não terão categoria atribuída.
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <UButton variant="outline" type="button" @click="closeModal">
          Cancelar
        </UButton>
        <UButton color="error" @click="onConfirm">
          Eliminar Categoria
        </UButton>
      </div>
    </div>
</template>
