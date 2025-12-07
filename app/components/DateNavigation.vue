<script setup lang="ts">
const props = defineProps<{
  month: number;
  year: number;
}>();

const emit = defineEmits<{
  "update:month": [number];
  "update:year": [number];
}>();

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const previousMonth = () => {
  if (props.month === 1) {
    emit("update:month", 12);
    emit("update:year", props.year - 1);
  } else {
    emit("update:month", props.month - 1);
  }
};

const nextMonth = () => {
  if (props.month === 12) {
    emit("update:month", 1);
    emit("update:year", props.year + 1);
  } else {
    emit("update:month", props.month + 1);
  }
};

const currentMonthName = computed(() => {
  return `${months[props.month - 1]} ${props.year}`;
});
</script>

<template>
  <div class="flex gap-2 justify-evenly">
    <UButton
      icon="i-heroicons-chevron-left"
      variant="outline"
      @click="previousMonth"
    />
    <UButton
      variant="outline"
      class="min-w-[140px] sm:min-w-[180px] text-sm sm:text-base"
    >
      {{ currentMonthName }}
    </UButton>
    <UButton
      icon="i-heroicons-chevron-right"
      variant="outline"
      @click="nextMonth"
    />
  </div>
</template>
