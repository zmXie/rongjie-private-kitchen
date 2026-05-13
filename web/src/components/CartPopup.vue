<template>
  <VanPopup v-model:show="showPopup" position="bottom" round :style="{ maxHeight: '75vh' }">
    <div class="cart-popup">
      <div class="cart-header">
        <div class="cart-header-left">
          <span class="cart-title">购物车</span>
          <span v-if="cartStore.items.length > 0" class="cart-count">{{ cartStore.totalItems }}件</span>
        </div>
        <VanButton v-if="cartStore.items.length > 0" size="mini" type="danger" plain round @click="handleClear">清空</VanButton>
      </div>

      <div v-if="cartStore.items.length > 0" class="cart-body">
        <div v-for="item in cartStore.items" :key="item.dish.id" class="cart-item">
          <img v-if="item.dish.image_url" :src="item.dish.image_url" class="cart-item-thumb" />
          <div v-else class="cart-item-thumb cart-item-thumb--empty">
            <VanIcon name="photo-o" size="16" color="var(--color-text-placeholder)" />
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">{{ item.dish.name }}</div>
            <div class="cart-item-bottom">
              <span class="cart-item-price">¥{{ item.dish.price.toFixed(2) }}</span>
              <VanStepper v-model="item.quantity" min="0" theme="round" input-width="32px" button-size="22px" @change="onQuantityChange(item.dish.id, item.quantity)" />
            </div>
          </div>
        </div>

        <div class="cart-remark">
          <VanField v-model="cartStore.remark" label="备注" placeholder="如：少辣、不要香菜" maxlength="100" show-word-limit />
        </div>
      </div>

      <VanEmpty v-else description="购物车是空的" :image-size="64" />

      <div v-if="cartStore.items.length > 0" class="cart-footer">
        <VanSubmitBar :price="cartStore.totalPrice * 100" button-text="提交订单" @submit="handleSubmit" :disabled="submitting" />
      </div>
    </div>
  </VanPopup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Popup as VanPopup, Button as VanButton, Stepper as VanStepper, Field as VanField, SubmitBar as VanSubmitBar, Empty as VanEmpty, Icon as VanIcon, showToast, showConfirmDialog } from 'vant';
import { useCartStore } from '@/stores/cart';
import { createOrder } from '@/api/orders';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', val: boolean): void }>();

const showPopup = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

const router = useRouter();
const cartStore = useCartStore();
const submitting = ref(false);

function onQuantityChange(dishId: number, quantity: number) {
  cartStore.updateQuantity(dishId, quantity);
}

async function handleClear() {
  try {
    await showConfirmDialog({ title: '确认清空', message: '确定要清空购物车吗？' });
    cartStore.clearCart();
  } catch {
    // cancelled
  }
}

async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;

  try {
    const order = await createOrder({
      items: cartStore.items.map(item => ({
        dish_id: item.dish.id,
        dish_name: item.dish.name,
        dish_price: item.dish.price,
        quantity: item.quantity,
      })),
      remark: cartStore.remark || undefined,
      total_price: cartStore.totalPrice,
    });

    cartStore.clearCart();
    emit('update:visible', false);
    showToast('下单成功');
    router.push({ name: 'order-detail', params: { id: order.id } });
  } catch (e: any) {
    showToast(e.message || '下单失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.cart-popup {
  display: flex;
  flex-direction: column;
  min-height: 30vh;
  max-height: 75vh;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.cart-header-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.cart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.cart-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-lg);
  padding-bottom: 60px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.cart-item:last-of-type {
  border-bottom: none;
}

.cart-item-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.cart-item-thumb--empty {
  background: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--space-xs);
}

.cart-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item-price {
  font-size: var(--font-size-sm);
  color: var(--color-price);
  font-weight: var(--font-weight-medium);
}

.cart-remark {
  padding: var(--space-sm) 0;
}

.cart-footer {
  flex-shrink: 0;
}
</style>
