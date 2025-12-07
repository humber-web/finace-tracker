<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  budget: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: { amount: number }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const amount = ref(0)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.budget) {
    amount.value = props.budget.budgetAmount / 100
  }
})

function onSubmit() {
  if (!amount.value) return

  emit('submit', {
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
  <Modal v-model="isOpen" title="Edit Budget">
    <form v-if="budget" @submit.prevent="onSubmit" class="space-y-4">
      <!-- Category Display -->
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: budget.categoryColor || '#6b7280' }"
          ></div>
          <div>
            <p class="font-semibold">{{ budget.categoryName }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Atual: {{ new Intl.NumberFormat('cv-CV', { style: 'currency', currency: 'CVE' }).format(budget.spent / 100) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium mb-2">Budget Amount *</label>
        <UInput
          v-model="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          icon="i-heroicons-currency-dollar"
          required
        />
      </div>
    </form>
  </Modal>
</template>
