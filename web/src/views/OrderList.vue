<template>
  <PageContainer title="订单管理" left-arrow :border="true" @click-left="router.back()">
    <Tabs v-model:active="activeTab" @change="onTabChange" class="sticky-tabs">
      <Tab title="全部" name="all" />
      <Tab title="待确认" name="0" />
      <Tab title="已确认" name="1" />
      <Tab title="已完成" name="2" />
      <Tab title="已取消" name="3" />
    </Tabs>

    <div class="order-list-content">
      <div v-if="loading" class="loading-wrapper">
        <VanLoading size="24px" vertical>加载中...</VanLoading>
      </div>

      <div v-else-if="orders.length > 0" class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-card" @click="goDetail(order.id)">
          <div class="card-body">
            <div class="card-header">
              <span class="card-id">订单号#{{ order.id }}</span>
              <VanTag :type="getStatusType(order.status)" size="medium" round>{{ getStatusText(order.status) }}</VanTag>
            </div>

            <div class="card-items">
              <div class="card-items-images">
                <img v-for="img in getOrderImages(order).slice(0, 4)" :key="img.id" :src="img.url" class="card-item-thumb" />
                <div v-if="getOrderImages(order).length === 0" class="card-item-thumb card-item-thumb--empty">
                  <VanIcon name="photo-o" size="12" color="var(--color-text-placeholder)" />
                </div>
              </div>
              <span class="card-items-text">{{ getOrderSummary(order) }}</span>
            </div>

            <div class="card-footer">
              <span class="card-time">{{ formatTime(order.created_at) }}</span>
              <span class="card-total">¥{{ order.total_price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <VanEmpty v-else description="暂无订单" />
    </div>

    <AppTabbar />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tab, Tabs, Tag as VanTag, Empty as VanEmpty, Loading as VanLoading, Icon as VanIcon, showToast } from 'vant';
import { getOrders } from '@/api/orders';
import { useDishStore } from '@/stores/dishes';
import PageContainer from '@/components/PageContainer.vue';
import AppTabbar from '@/components/AppTabbar.vue';
import type { Order } from '@/types';

const router = useRouter();
const dishStore = useDishStore();

const orders = ref<Order[]>([]);
const loading = ref(false);
const activeTab = ref<string | number>('all');

const STATUS_MAP: Record<number, { text: string; type: string }> = {
  0: { text: '待确认', type: 'warning' },
  1: { text: '已确认', type: 'primary' },
  2: { text: '已完成', type: 'success' },
  3: { text: '已取消', type: 'danger' }
};

function getStatusText(status: number) {
  return STATUS_MAP[status]?.text ?? '未知';
}

function getStatusType(status: number) {
  return (STATUS_MAP[status]?.type as any) ?? 'default';
}

function formatTime(time: string) {
  const d = new Date(time);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${min}`;
}

function getOrderSummary(order: Order) {
  const items = order.items || [];
  if (items.length === 0) return '--';
  const names = items.map(i => i.dish_name).join('、');
  const suffix = items.length > 2 ? '等' : '';
  return `${names}${suffix} ${items.reduce((s, i) => s + i.quantity, 0)}件`;
}

function getOrderImages(order: Order) {
  const items = order.items || [];
  const images: { id: number; url: string }[] = [];
  for (const item of items) {
    if (!item.dish_id) continue;
    const dish = dishStore.dishes.find(d => d.id === item.dish_id);
    if (dish?.image_url) {
      images.push({ id: item.id, url: dish.image_url });
    }
  }
  return images;
}

async function fetchOrders() {
  loading.value = true;
  try {
    const status = activeTab.value === 'all' ? undefined : Number(activeTab.value);
    orders.value = await getOrders(status);
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  fetchOrders();
}

function goDetail(id: number) {
  router.push({ name: 'order-detail', params: { id } });
}

onMounted(async () => {
  if (!dishStore.initialized) {
    await dishStore.fetchDishes();
  }
  fetchOrders();
});
</script>

<style scoped>
.sticky-tabs {
  position: sticky;
  top: 46px;
  z-index: 99;
}

.order-list-content {
  padding: var(--space-md);
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  min-height: 50vh;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--space-2xl);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.order-card {
  display: flex;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.15s ease;
}

.order-card:active {
  transform: scale(0.98);
}

.card-body {
  flex: 1;
  padding: var(--space-lg);
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.card-id {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-items {
  margin-bottom: var(--space-sm);
}

.card-items-images {
  display: flex;
  gap: 6px;
  margin-bottom: var(--space-xs);
}

.card-item-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.card-item-thumb--empty {
  background: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-items-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.card-total {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-price);
}
</style>
