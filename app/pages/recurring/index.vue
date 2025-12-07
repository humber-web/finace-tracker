<script setup lang="ts">
const formRef = ref<any>(null);
const delRef = ref<any>(null);
const toast = useToast();
const open = ref(false);
const { data: recurringTransactions, refresh } = await useFetch(
  "/api/recurring-transactions"
);

const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingRecurring = ref<any>(null);
const deletingRecurring = ref<any>(null);

function openAddModal() {
  editingRecurring.value = null;
  open.value = true;
}

function openEditModal(recurring: any) {
  editingRecurring.value = recurring;
  open.value = true;
}

function openDeleteModal(recurring: any) {
  deletingRecurring.value = recurring;
  isDeleteModalOpen.value = true;
}

async function handleFormSubmit(data: any) {
  try {
    if (editingRecurring.value) {
      await $fetch(`/api/recurring-transactions/${editingRecurring.value.id}`, {
        method: "PUT",
        body: data,
      });
      toast.add({
        title: "Success",
        description: "Recurring transaction updated successfully",
        color: "success",
      });
    } else {
      await $fetch("/api/recurring-transactions", {
        method: "POST",
        body: data,
      });
      toast.add({
        title: "Success",
        description: "Recurring transaction created successfully",
        color: "success",
      });
    }

    open.value = false;
    await refresh();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to save recurring transaction",
      color: "error",
    });
  }
}

async function handleDelete() {
  try {
    await $fetch(`/api/recurring-transactions/${deletingRecurring.value.id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Success",
      description: "Recurring transaction deleted",
      color: "success",
    });

    isDeleteModalOpen.value = false;
    await refresh();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to delete recurring transaction",
      color: "error",
    });
  }
}

async function toggleActive(recurring: any) {
  try {
    await $fetch(`/api/recurring-transactions/${recurring.id}`, {
      method: "PUT",
      body: { isActive: !recurring.isActive },
    });

    toast.add({
      title: "Success",
      description: `Recurring transaction ${
        recurring.isActive ? "paused" : "activated"
      }`,
      color: "success",
    });

    await refresh();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to update status",
      color: "error",
    });
  }
}

async function processRecurring() {
  try {
    const result = await $fetch("/api/recurring-transactions/process", {
      method: "POST",
    });

    toast.add({
      title: "Success",
      description: result.message,
      color: "success",
    });

    await refresh();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to process recurring transactions",
      color: "error",
    });
  }
}

function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
  return `${formatted} CVE`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-CV", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    daily: "Diária",
    weekly: "Semanal",
    monthly: "Mensal",
    yearly: "Anual",
  };
  return labels[frequency] || frequency;
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold">Transações Recorrentes</h2>
        <p class="text-sm opacity-70 mt-1">
          Gerencie suas receitas e despesas recorrentes
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="outline"
          class="w-full sm:w-auto"
          @click="processRecurring"
        >
          <span class="sm:hidden">Processar</span>
          <span class="hidden sm:inline">Processar Agora</span>
        </UButton>
        <UButton icon="i-heroicons-plus" class="w-full sm:w-auto" @click="openAddModal">
          <span class="sm:hidden">Adicionar</span>
          <span class="hidden sm:inline">Adicionar Recorrente</span>
        </UButton>
      </div>
    </div>

    <UCard>
      <div
        v-if="!recurringTransactions || recurringTransactions.length === 0"
        class="text-center py-12 text-gray-500"
      >
        Nenhuma transação recorrente encontrada.
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="recurring in recurringTransactions"
          :key="recurring.id"
          class="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded transition-colors"
        >
          <!-- Icon and Details -->
          <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div class="shrink-0">
              <UBadge
                :color="recurring.category?.color ? recurring.category.color : 'neutral'"
                variant="outline"
                size="lg"
              >
                <UIcon
                  :name="recurring.category?.icon || 'i-heroicons-arrow-path'"
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  :class="recurring.isActive ? '' : 'opacity-40'"
                />
              </UBadge>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3
                  class="font-semibold text-sm sm:text-base"
                  :class="recurring.isActive ? '' : 'opacity-40'"
                >
                  {{ recurring.description }}
                </h3>
                <UBadge v-if="!recurring.isActive" color="warning" size="xs">
                  Pausado
                </UBadge>
              </div>
              <div class="text-xs sm:text-sm opacity-70 mt-1 flex flex-wrap gap-1">
                <span>{{ recurring.category?.name || "Sem categoria" }}</span>
                <span>·</span>
                <span>{{ getFrequencyLabel(recurring.frequency) }}</span>
                <span class="hidden sm:inline">·</span>
                <span class="hidden sm:inline">Próximo: {{ formatDate(recurring.nextOccurrence) }}</span>
              </div>
              <div class="text-xs opacity-70 mt-1 sm:hidden">
                Próximo: {{ formatDate(recurring.nextOccurrence) }}
              </div>
            </div>
          </div>

          <!-- Amount and Actions -->
          <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <!-- Amount -->
            <UBadge
              :color="recurring.type === 'income' ? 'success' : 'error'"
              variant="subtle"
              size="lg"
              class="font-semibold"
            >
              {{ recurring.type === "income" ? "+" : "-" }}{{ formatCurrency(recurring.amount) }}
            </UBadge>

            <!-- Actions -->
            <div class="flex items-center gap-1 sm:gap-2">
              <UButton
                icon="i-heroicons-pencil-square"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="openEditModal(recurring)"
              />
              <UButton
                :icon="recurring.isActive ? 'i-heroicons-pause' : 'i-heroicons-play'"
                variant="ghost"
                :color="recurring.isActive ? 'warning' : 'success'"
                size="sm"
                @click="toggleActive(recurring)"
              />
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="error"
                size="sm"
                @click="openDeleteModal(recurring)"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>
    <UModal
      v-model:open="open"
      :title="editingRecurring ? 'Editar' : 'Nova'"
      description="Preencha os campos abiaxo pra criar ou editar"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <RecurringTransactionFormModal
          ref="formRef"
          v-model="open"
          :recurring="editingRecurring"
          @submit="handleFormSubmit"
        />
      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          :label="editingRecurring ? 'Atualizar' : 'Criar'"
          color="primary"
          @click="formRef?.submit()"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteModalOpen"
      :title="'Excluir Recorrente'"
      description="Tem certeza que deseja excluir esta transação recorrente? Esta ação não pode ser desfeita."
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <RecurringTransactionDeleteModal
          v-model="isDeleteModalOpen"
          :recurring="deletingRecurring"
          @confirm="handleDelete"
        />


      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          variant="outline"
          @click="close"
        />
        <UButton
          label="Excluir Recorrente"
          color="error"
          @click="handleDelete()"
        />
      </template>
    </UModal>
  </div>
</template>
