<script setup lang="ts">
const open = ref(false);
const formRef = ref<any>(null);

const toast = useToast();
const isModalOpen = ref(false);
const editingTransaction = ref<any>(null);

const currentDate = new Date();
const selectedMonth = ref(currentDate.getMonth() + 1);
const selectedYear = ref(currentDate.getFullYear());

const { data: transactions, refresh } = await useFetch(
  "/api/transactions/monthly",
  {
    query: { month: selectedMonth, year: selectedYear },
    watch: [selectedMonth, selectedYear],
  }
);

function openCreateModal() {
  editingTransaction.value = null;
  open.value = true;
}

async function handleEdit(id: number) {
  const transaction = transactions.value?.find((t) => t.id === id);
  if (transaction) {
    editingTransaction.value = transaction;
    open.value = true;
  }
}

function closeModal() {
  open.value = false;
  editingTransaction.value = null;
}

async function handleSubmit(data: any) {
  try {
    if (editingTransaction.value) {
      await $fetch(`/api/transactions/${editingTransaction.value.id}`, {
        method: "PUT",
        body: data,
      });
      toast.add({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
        color: "success",
      });
    } else {
      await $fetch("/api/transactions", {
        method: "POST",
        body: data,
      });
      toast.add({
        title: "Sucesso",
        description: "Transação criada com sucesso",
        color: "success",
      });
    }

    closeModal();
    await refresh();
  } catch (error) {
    toast.add({
      title: "Erro",
      description: "Não foi possível salvar a transação",
      color: "error",
    });
  }
}

async function handleDelete(ids: number[]) {
  try {
    await $fetch("/api/transactions/bulk-delete", {
      method: "POST",
      body: { ids },
    });

    toast.add({
      title: "Sucesso",
      description: `${ids.length} transação(ões) excluída(s)`,
      color: "success",
    });

    await refresh();
  } catch (error) {
    toast.add({
      title: "Erro",
      description: "Falha ao excluir transações",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold">Transações</h2>

      <DateNavigation
        :month="selectedMonth"
        :year="selectedYear"
        @update:month="selectedMonth = $event"
        @update:year="selectedYear = $event"
      />
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 class="text-base sm:text-lg font-semibold">Todas as Transações</h3>
          <UButton @click="openCreateModal" icon="i-heroicons-plus">
            Adicionar Transação
          </UButton>
        </div>
      </template>

      <div
        v-if="!transactions || transactions.length === 0"
        class="text-center py-12 text-gray-500"
      >
        Nenhuma transação encontrada.
      </div>

      <TransactionsTable
        v-else
        :transactions="transactions"
        @delete="handleDelete"
        @edit="handleEdit"
      />
    </UCard>

   

    <UModal
      v-model:open="open"
      :title="editingTransaction ? 'Editar Transação' : 'Nova Transação'"
      description="Preencha os campos abaixo para criar ou editar uma transação."
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <TransactionForm
          ref="formRef"
          :initial-data="editingTransaction"
          :submit-label="editingTransaction ? 'Atualizar' : 'Criar'"
          @submit="handleSubmit"
          @cancel="closeModal"
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
          :label="editingTransaction ? 'Atualizar' : 'Criar'"
          color="primary"
          @click="formRef?.submit()"
        />
      </template>
    </UModal>
  </div>
</template>
