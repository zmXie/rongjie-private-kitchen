import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Dish, CartItem } from '@/types';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const remark = ref('');

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
  );

  function addItem(dish: Dish) {
    const existing = items.value.find(item => item.dish.id === dish.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ dish, quantity: 1 });
    }
  }

  function removeItem(dishId: number) {
    items.value = items.value.filter(item => item.dish.id !== dishId);
  }

  function updateQuantity(dishId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    const item = items.value.find(item => item.dish.id === dishId);
    if (item) {
      item.quantity = quantity;
    }
  }

  function getQuantity(dishId: number): number {
    return items.value.find(item => item.dish.id === dishId)?.quantity ?? 0;
  }

  function clearCart() {
    items.value = [];
    remark.value = '';
  }

  return {
    items,
    remark,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    getQuantity,
    clearCart,
  };
});
