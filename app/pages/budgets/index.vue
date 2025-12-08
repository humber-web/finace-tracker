<script setup lang="ts">
import { is } from 'drizzle-orm';

const toast = useToast();
const formRef = ref<any>(null);

const currentDate = new Date();
const selectedMonth = ref(currentDate.getMonth() + 1);
const selectedYear = ref(currentDate.getFullYear());

const { data: budgets, refresh: refreshBudgets } = await useFetch(
  "/api/budgets",
  {
    query: { month: selectedMonth, year: selectedYear },
    watch: [selectedMonth, selectedYear],
  }
);

const { data: alerts, refresh: refreshAlerts } = await useFetch(
  "/api/budgets/alerts",
  {
    query: { month: selectedMonth, year: selectedYear },
    watch: [selectedMonth, selectedYear],
  }
);

const { data: categories } = await useFetch("/api/categories");

const isFormModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingBudget = ref<any>(null);
const isDeleteModalOpen = ref(false);
const deletingBudget = ref<any>(null);

function openAddModal() {
  isFormModalOpen.value = true;
}

function openEditModal(budget: any) {
  editingBudget.value = budget;
  isEditModalOpen.value = true;
}

function openDeleteModal(budget:any) {
  deletingBudget.value = budget;
  isDeleteModalOpen.value = true;
}

async function handleCreate(data: any) {
  try {
    await $fetch("/api/budgets", {
      method: "POST",
      body: {
        ...data,
        month: selectedMonth.value,
        year: selectedYear.value,
      },
    });

    toast.add({
      title: "Success",
      description: "Orçamento criado com sucesso",
      color: "success",
    });

    isFormModalOpen.value = false;
    await refreshBudgets();
    await refreshAlerts();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Falha ao criar orçamento",
      color: "error",
    });
  }
}

async function handleUpdate(data: any) {
  try {
    await $fetch(`/api/budgets/${editingBudget.value.id}`, {
      method: "PUT",
      body: data,
    });

    toast.add({
      title: "Success",
      description: "Orçamento atualizado com sucesso",
      color: "success",
    });

    isEditModalOpen.value = false;
    await refreshBudgets();
    await refreshAlerts();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Falha ao atualizar orçamento",
      color: "error",
    });
  }
}

async function handleDelete(budgetId: number) {

  try {
    await $fetch(`/api/budgets/${budgetId}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Success",
      description: "Orçamento excluído com sucesso",
      color: "success",
    });
    isDeleteModalOpen.value = false;
    await refreshBudgets();
    await refreshAlerts();
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Falha ao excluir orçamento",
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

function getProgressColor(percent: number) {
  if (percent >= 100) return "error";    
  if (percent >= 85) return "warning";   
  if (percent >= 70) return "info";     
  return "success";                       
}

function getAlertColor(level: string) {
  switch (level) {
    case "critical":
      return "error";
    case "danger":
      return "warning";
    case "warning":
      return "info";
    default:
      return "neutral";
  }
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h2 class="text-2xl font-bold">Orçamentos</h2>
        <p class="text-sm opacity-70 mt-1">
          Acompanhe e gerencie seus limites de gastos mensais
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <DateNavigation
          :month="selectedMonth"
          :year="selectedYear"
          @update:month="selectedMonth = $event"
          @update:year="selectedYear = $event"
        />
        <UButton icon="i-heroicons-plus" class="w-full sm:w-auto" @click="openAddModal">
          <span class="sm:hidden">Adicionar</span>
          <span class="hidden sm:inline">Adicionar Orçamento</span>
        </UButton>
      </div>
    </div>

    <!-- Alerts Section -->
    <UCard v-if="alerts && alerts.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <UBadge color="warning" variant="outline">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
          </UBadge>
          <h3 class="text-base sm:text-lg font-semibold">Alertas de Orçamento</h3>
        </div>
      </template>

      <div class="space-y-3">
        <UAlert
          v-for="alert in alerts"
          :key="alert.id"
          :color="getAlertColor(alert.alertLevel)"
          :icon="
            alert.alertLevel === 'critical'
              ? 'i-heroicons-exclamation-circle'
              : alert.alertLevel === 'danger'
              ? 'i-heroicons-exclamation-triangle'
              : 'i-heroicons-information-circle'
          "
          :title="alert.categoryName"
          :description="alert.message"
        >
          <template #actions>
            <UBadge :color="getAlertColor(alert.alertLevel)" size="sm">
              {{ alert.percentUsed.toFixed(0) }}%
            </UBadge>
          </template>
          <template #description>
            <div class="space-y-2">
              <p class="text-sm">{{ alert.message }}</p>
              <div class="flex flex-col sm:flex-row sm:gap-4 gap-1 text-xs">
                <span>Gasto: {{ formatCurrency(alert.spent) }} / {{ formatCurrency(alert.budgetAmount) }}</span>
                <span>Projetado: {{ formatCurrency(alert.projectedSpending) }}</span>
                <span>{{ alert.daysRemaining }} dias restantes</span>
              </div>
            </div>
          </template>
        </UAlert>
      </div>
    </UCard>

    <!-- Budgets List -->
    <UCard>
      <template #header>
        <h3 class="text-base sm:text-lg font-semibold">Seus Orçamentos</h3>
      </template>

      <div
        v-if="!budgets || budgets.length === 0"
        class="text-center py-12 opacity-70"
      >
        Nenhum orçamento definido para este mês. Clique em "Adicionar Orçamento" para criar um.
      </div>

      <div v-else class="space-y-3 sm:space-y-4">
        <div
          v-for="budget in budgets"
          :key="budget.id"
          class="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <UBadge
                :color="budget.categoryColor || 'neutral'"
                variant="outline"
              >
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: budget.categoryColor || '#6b7280' }"></div>
              </UBadge>
              <h4 class="font-semibold text-sm sm:text-base truncate">{{ budget.categoryName }}</h4>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <div class="text-left sm:text-right">
                <div class="text-xs sm:text-sm font-medium">
                  {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.budgetAmount) }}
                </div>
                <div class="text-xs opacity-70">
                  {{ formatCurrency(budget.budgetAmount - budget.spent) }} restante
                </div>
              </div>
              <div class="flex gap-1 sm:gap-2">
                <UButton
                  icon="i-heroicons-pencil-square"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="openEditModal(budget)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  variant="ghost"
                  color="error"
                  size="sm"
                  @click="openDeleteModal(budget)"
                />
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <UProgress
            :model-value="Math.min((budget.spent / budget.budgetAmount) * 100, 100)"
            :color="getProgressColor((budget.spent / budget.budgetAmount) * 100)"
            size="xl"
            status
          />
        </div>
      </div>
    </UCard>
    <UModal
      v-model:open="isFormModalOpen"
      title="Adicionar Orçamento"
      description="Defina o limite do seu orçamento"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <BudgetFormModal
          ref="formRef"
          v-model="isFormModalOpen"
          title="Adicionar Orçamento"
          :categories="categories?.filter((c) => c.type === 'expense') || []"
          @submit="handleCreate"
        />
      </template>
      <template #footer="{ close }">
        <UButton label="Cancelar" variant="outline" @click="close" />
        <UButton label="Criar Orcamento" color="primary" @click="formRef?.onSubmit()" />
      </template>
    </UModal>

    <UModal
      v-model:open="isEditModalOpen"
      title="Editar Orçamento"
      description="Atualize o limite do seu orcamento"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <BudgetEditModal
          ref="formRef"
          v-if="isEditModalOpen"
          v-model="isEditModalOpen"
          :budget="editingBudget"
          @submit="handleUpdate"
        />
      </template>
      <template #footer="{ close }">
        <UButton label="Cancelar" variant="outline" @click="close" />
        <UButton
          label="Atualizar Orcamento"
          color="primary"
          @click="formRef?.onSubmit()"
        />
      </template>
    </UModal>

    <UModal 
    v-model:open="isDeleteModalOpen"
    title="Tem certeza que deseja eliminar"
    description="Esta acao nao pode ser desfeita."
    :ui="{footer: 'justify-end'}"
    >
    <template #footer>
      <UButton label="Cancelar" variant="outline" @click="isDeleteModalOpen = false" />
      <UButton
        label="Excluir Orcamento"
        color="error"
        @click="handleDelete(deletingBudget.id)"
      />
    </template>
     

    </UModal>

    <!-- Add Budget Modal -->

    <!-- Edit Budget Modal -->
  </div>
</template>
