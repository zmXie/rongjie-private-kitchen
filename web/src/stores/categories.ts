import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Category } from '@/types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories';

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const activeCategoryId = ref<number | string | undefined>(undefined);

  const sortedCategories = computed(() =>
    [...categories.value].sort((a, b) => a.sort - b.sort)
  );

  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      const res = await getCategories();
      categories.value = res;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function addCategory(name: string, sort = 0) {
    const res = await createCategory({ name, sort });
    categories.value.push(res);
    return res;
  }

  async function editCategory(id: number, name: string, sort: number) {
    const res = await updateCategory(id, { name, sort });
    const index = categories.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories.value[index] = res;
    }
    return res;
  }

  async function removeCategory(id: number) {
    await deleteCategory(id);
    categories.value = categories.value.filter((c) => c.id !== id);
  }

  return {
    categories,
    sortedCategories,
    activeCategoryId,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
});