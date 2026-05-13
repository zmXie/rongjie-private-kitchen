import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Dish } from '@/types';
import { getDishes, createDish, updateDish, deleteDish, uploadImage } from '@/api/dishes';

export const useDishStore = defineStore('dishes', () => {
  const dishes = ref<Dish[]>([]);
  const loading = ref(false);
  const initialized = ref(false);
  const error = ref<string | null>(null);

  async function fetchDishes(categoryId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await getDishes(categoryId);
      dishes.value = res;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function addDish(data: {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    sort?: number;
    is_recommended?: number;
    is_sold_out?: number;
  }) {
    const res = await createDish(data);
    dishes.value.push(res);
    return res;
  }

  async function editDish(id: number, data: Partial<Dish>) {
    const res = await updateDish(id, data);
    const index = dishes.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      dishes.value[index] = res;
    }
    return res;
  }

  async function removeDish(id: number) {
    await deleteDish(id);
    dishes.value = dishes.value.filter((d) => d.id !== id);
  }

  async function upload(file: File) {
    const res = await uploadImage(file);
    return res.url;
  }

  function getDishesByCategory(categoryId: number) {
    return dishes.value.filter((d) => d.category_id === categoryId && d.status === 1);
  }

  return {
    dishes,
    loading,
    initialized,
    error,
    fetchDishes,
    addDish,
    editDish,
    removeDish,
    upload,
    getDishesByCategory,
  };
});