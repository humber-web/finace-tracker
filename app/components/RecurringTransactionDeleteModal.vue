<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  recurring: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function onConfirm() {
  emit('confirm')
}

function closeModal() {
  emit('update:modelValue', false)
}
defineExpose({
  closeModal,
  onConfirm
})

</script>

<template>
    <div class="space-y-4">
      <div v-if="recurring" class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <UIcon :name="recurring.category?.icon || 'i-heroicons-arrow-path'" class="w-6 h-6" />
          <div>
            <p class="font-semibold">{{ recurring.description }}</p>
            <p class="text-sm text-gray-500">
              {{ recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1) }} {{ recurring.type }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Atenção:</strong> Isso não excluirá as transações que já foram criadas a partir deste modelo de transação recorrente.
        </p>
      </div>
    </div>
</template>
