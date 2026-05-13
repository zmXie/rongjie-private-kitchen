<template>
  <template v-if="cartStore.totalItems > 0">
    <div class="cart-fab" @click="showCartPopup = true">
      <VanIcon name="shopping-cart-o" size="22" color="#fff" />
      <span class="cart-badge">{{ cartStore.totalItems }}</span>
    </div>
    <CartPopup v-model:visible="showCartPopup" />
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon as VanIcon } from 'vant';
import { useCartStore } from '@/stores/cart';
import CartPopup from '@/components/CartPopup.vue';

const cartStore = useCartStore();
const showCartPopup = ref(false);
</script>

<style scoped>
.cart-fab {
  position: fixed;
  right: var(--space-lg);
  bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(192, 57, 43, 0.4);
  z-index: 90;
  transition: transform 0.2s ease;
}

.cart-fab:active {
  transform: scale(0.92);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--color-price);
  color: #fff;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
