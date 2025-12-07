<script setup lang="ts">
import { is } from "drizzle-orm";
import { ref, computed, watch, nextTick } from "vue";

definePageMeta({
  layout: "default",
});

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  createdAt: string;
};

const route = useRoute();
const router = useRouter();

const formRef = ref<any>(null);

// Active tab from URL query or default to 'expense'
const activeTab = computed(() =>
  route.query.type === "income" ? "income" : "expense"
);

const tabs = [
  { key: "expense", label: "Categorias de Despesas" },
  { key: "income", label: "Categorias de Receitas" },
];

const { data: categories, refresh: refreshCategories } = await useFetch(
  "/api/categories"
);

const filteredCategories = computed(
  () => categories.value?.filter((c) => c.type === activeTab.value) || []
);

// Modal states (local, not URL-based) - always start closed
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const formMode = ref<"add" | "edit">("add");
const editingCategory = ref<Category | null>(null);
const deletingCategory = ref<Category | null>(null);

// Close all modals when tab changes
watch(activeTab, () => {
  isFormModalOpen.value = false;
  isDeleteModalOpen.value = false;
});

// Tab change handler
function changeTab(type: "income" | "expense") {
  router.push({ query: { type } });
}

// Modal handlers
function openAddModal() {
  formMode.value = "add";
  editingCategory.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(category: Category) {
  formMode.value = "edit";
  editingCategory.value = category;
  isFormModalOpen.value = true;
}

function openDeleteModal(category: Category) {
  deletingCategory.value = category;
  isDeleteModalOpen.value = true;
}

// API handlers
async function handleFormSubmit(data: {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}) {
  try {
    if (formMode.value === "add") {
      await $fetch("/api/categories", {
        method: "POST",
        body: data,
      });
      useToast().add({
        title: "Category created successfully",
        color: "success",
      });
    } else if (formMode.value === "edit" && editingCategory.value) {
      await $fetch(`/api/categories/${editingCategory.value.id}`, {
        method: "PATCH",
        body: {
          name: data.name,
          color: data.color,
          icon: data.icon,
        },
      });
      useToast().add({
        title: "Category updated successfully",
        color: "success",
      });
    }
    await refreshCategories();
    // The modal will close itself via the emit in CategoryFormModal
  } catch (error) {
    useToast().add({
      title: `Error ${
        formMode.value === "add" ? "creating" : "updating"
      } category`,
      color: "error",
    });
  }
}

async function handleDeleteConfirm() {
  if (!deletingCategory.value) return;

  try {
    await $fetch(`/api/categories/${deletingCategory.value.id}`, {
      method: "DELETE",
    });
    useToast().add({
      title: "Category deleted successfully",
      color: "success",
    });
    await refreshCategories();
    deletingCategory.value = null;
    // The modal will close itself via the emit in CategoryDeleteModal
  } catch (error) {
    useToast().add({ title: "Error deleting category", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold">Categorias</h1>
      <p class="mt-2 text-sm opacity-70">
        Gerencie suas categorias de receita e despesas aqui.
      </p>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-4 sm:gap-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="changeTab(tab.key as 'income' | 'expense')"
          :class="[
            'whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors shrink-0',
            activeTab === tab.key
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="space-y-4 sm:space-y-6">
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
      >
        <div>
          <h3 class="text-base sm:text-lg font-semibold">
            Categorias de {{ activeTab === "income" ? "Receitas" : "Despesas" }}
          </h3>
          <p class="text-xs sm:text-sm opacity-70 mt-1">
            {{ filteredCategories.length }} categorias encontradas
          </p>
        </div>
        <UButton
          @click="openAddModal()"
          icon="i-heroicons-plus"
          class="w-full sm:w-auto"
          size="lg"
        >
          <span class="sm:hidden">Adicionar</span>
          <span class="hidden sm:inline">Adicionar Categoria</span>
        </UButton>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredCategories.length === 0"
        class="text-center py-12 sm:py-16"
      >
        <UBadge color="neutral" variant="outline" size="lg" class="mb-4">
          <UIcon
            :name="
              activeTab === 'income'
                ? 'i-heroicons-banknotes'
                : 'i-heroicons-tag'
            "
            class="w-12 h-12 sm:w-16 sm:h-16"
          />
        </UBadge>
        <h3 class="text-base sm:text-lg font-medium mb-2">
          Não há {{ activeTab === "income" ? "Receita" : "Despesa" }} categorias
        </h3>
        <p class="text-sm opacity-70 mb-6">
          Comece criando sua primeira categoria de
          {{ activeTab === "income" ? "Receita" : "Despesa" }}
        </p>
        <UButton
          @click="openAddModal()"
          icon="i-heroicons-plus"
          class="w-full sm:w-auto"
        >
          <span class="sm:hidden">Adicionar</span>
          <span class="hidden sm:inline"
            >Adicionar Categoria de
            {{ activeTab === "income" ? "Receita" : "Despesa" }}</span
          >
        </UButton>
      </div>

      <!-- Category Table -->
      <UCard v-else>
        <CategoryTable
          :categories="filteredCategories"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </UCard>
    </div>
    <UModal
      v-model:open="isFormModalOpen"
      :title="formMode === 'add' ? 'Criar Categoria' : 'Editar Categoria'"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <CategoryFormModal
          ref="formRef"
          v-model="isFormModalOpen"
          :mode="formMode"
          :category-type="activeTab"
          :category="editingCategory"
          @submit="handleFormSubmit"
        />
      </template>
      <template #footer>
        <UButton
          variant="outline"
          type="button"
          @click="isFormModalOpen = false"
        >
          Cancelar
        </UButton>
        <UButton @click="formRef.onSubmit()">
          {{ formMode === "add" ? "Adicionar" : "Atualizar" }} Categoria
        </UButton>
      </template>
    </UModal>
    <UModal
      v-model:open="isDeleteModalOpen"
      title="Eliminar Categoria"
      description="Tens certeza que queres eliminar esta categoria?"
    >
      <template #body>
        <CategoryDeleteModal
          v-model="isDeleteModalOpen"
          :category="deletingCategory"
          @confirm="handleDeleteConfirm"
        />
      </template>
    </UModal>
  </div>
</template>
