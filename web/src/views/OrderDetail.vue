<template>
  <PageContainer title="订单详情" left-arrow :border="false" :loading="loading" @click-left="router.back()">
    <template #nav-right>
      <VanIcon name="share-o" size="20" color="var(--color-text-primary)" @click="handleShare" />
    </template>

    <template v-if="order">
      <!-- 订单进度 -->
      <div class="status-progress">
        <VanSteps v-if="order.status !== 3" :active="order.status" active-color="var(--color-primary)">
          <VanStep>待确认</VanStep>
          <VanStep>已确认</VanStep>
          <VanStep>已完成</VanStep>
        </VanSteps>
        <div v-else class="progress-rejected">
          <VanIcon name="close" size="20" color="var(--color-text-placeholder)" />
          <span>已拒绝</span>
        </div>
      </div>

      <div class="detail-content">
        <!-- 订单信息 -->
        <div class="section-card">
          <div class="section-row">
            <span class="section-label">订单号</span>
            <span class="section-value">#{{ order.id }}</span>
          </div>
          <div class="section-row">
            <span class="section-label">下单时间</span>
            <span class="section-value">{{ formatTime(order.created_at) }}</span>
          </div>
          <div v-if="order.status === 3 && order.reject_reason" class="section-row">
            <span class="section-label">拒绝原因</span>
            <span class="section-value section-value--danger">{{ order.reject_reason }}</span>
          </div>
        </div>

        <!-- 菜品列表 -->
        <div class="section-card">
          <div class="section-header">菜品明细</div>
          <div v-for="item in order.items || []" :key="item.id" class="dish-row" :class="{ 'dish-row--clickable': item.dish_id }" @click="goDish(item.dish_id)">
            <img v-if="getDishImage(item.dish_id)" :src="getDishImage(item.dish_id)" class="dish-row-thumb" />
            <div v-else class="dish-row-thumb dish-row-thumb--empty">
              <VanIcon name="photo-o" size="14" color="var(--color-text-placeholder)" />
            </div>
            <div class="dish-row-info">
              <div class="dish-row-top">
                <span class="dish-row-name">{{ item.dish_name }}</span>
                <span class="dish-row-subtotal">¥{{ (item.dish_price * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="dish-row-bottom">
                <span class="dish-row-unit">¥{{ item.dish_price.toFixed(2) }}/份</span>
                <span class="dish-row-qty">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="order-divider" />

          <div class="order-summary">
            <div v-if="order.remark" class="summary-remark">
              <VanIcon name="comment-o" size="14" color="var(--color-text-secondary)" />
              <span>{{ order.remark }}</span>
            </div>
            <div class="summary-total">
              <span>合计</span>
              <span class="summary-price">¥{{ order.total_price.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 评价入口（已完成且未评价） -->
        <div v-if="order.status === 2 && !order.rating" class="section-card review-entry">
          <VanButton type="primary" round block @click="openReviewDialog">
            <VanIcon name="star-o" size="16" />
            评价本次用餐
          </VanButton>
        </div>

        <!-- 已评价显示 -->
        <div v-if="order.rating" class="section-card review-display">
          <div class="section-header">用餐评价</div>
          <div class="review-stars">
            <VanRate v-model="order.rating" readonly void-icon="star-o" color="#f5a623" void-color="#eee" size="20" />
          </div>
          <div v-if="order.review" class="review-text">{{ order.review }}</div>
        </div>
      </div>

      <!-- 管理员操作 -->
      <div v-if="isAdmin && order.status <= 1" class="order-actions">
        <VanButton type="default" round block @click="handleReject">拒绝接单</VanButton>
        <VanButton v-if="order.status === 0" type="primary" round block @click="handleUpdateStatus(1)">确认接单</VanButton>
        <VanButton v-if="order.status === 1" type="primary" round block @click="handleUpdateStatus(2)">标记完成</VanButton>
      </div>
    </template>

    <VanEmpty v-else-if="!loading" description="订单不存在" />

    <!-- 拒绝接单弹窗 -->
    <VanDialog v-model:show="showRejectDialog" title="拒绝接单" :show-confirm-button="false" :close-on-click-overlay="true">
      <div class="reject-form">
        <VanRadioGroup v-model="rejectReason">
          <div v-for="reason in PRESET_REASONS" :key="reason" class="reject-option">
            <VanRadio :name="reason">{{ reason }}</VanRadio>
          </div>
        </VanRadioGroup>
        <VanField
          v-if="rejectReason === '其他'"
          v-model="rejectCustomReason"
          placeholder="请输入具体原因"
          maxlength="100"
          show-word-limit
        />
        <div class="reject-actions">
          <VanButton block @click="showRejectDialog = false">取消</VanButton>
          <VanButton block type="primary" @click="confirmReject">确定</VanButton>
        </div>
      </div>
    </VanDialog>

    <!-- 评价弹窗 -->
    <VanDialog v-model:show="showReviewDialog" title="评价用餐" :show-confirm-button="false" :close-on-click-overlay="true">
      <div class="review-form">
        <div class="review-form-rating">
          <span class="review-form-label">评分</span>
          <VanRate v-model="reviewRating" void-icon="star-o" color="#f5a623" void-color="#eee" size="28" />
        </div>
        <VanField
          v-model="reviewText"
          type="textarea"
          placeholder="分享您的用餐体验（选填）"
          rows="3"
          maxlength="500"
          show-word-limit
        />
        <div class="review-form-actions">
          <VanButton block @click="showReviewDialog = false">取消</VanButton>
          <VanButton block type="primary" :loading="submittingReview" @click="submitReviewHandler">提交评价</VanButton>
        </div>
      </div>
    </VanDialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Icon as VanIcon, Button as VanButton, Empty as VanEmpty,
  Steps as VanSteps, Step as VanStep, Dialog as VanDialog,
  RadioGroup as VanRadioGroup, Radio as VanRadio, Field as VanField,
  Rate as VanRate, showToast
} from 'vant';
import { getOrder, updateOrderStatus, submitReview } from '@/api/orders';
import { useAdminStore } from '@/stores/admin';
import { useDishStore } from '@/stores/dishes';
import PageContainer from '@/components/PageContainer.vue';
import type { Order } from '@/types';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const dishStore = useDishStore();

const order = ref<Order | null>(null);
const loading = ref(true);

const isAdmin = computed(() => adminStore.isAdmin);

const PRESET_REASONS = ['食材不足', '时间冲突', '已打烊', '其他'];
const showRejectDialog = ref(false);
const rejectReason = ref('');
const rejectCustomReason = ref('');

const showReviewDialog = ref(false);
const reviewRating = ref(5);
const reviewText = ref('');
const submittingReview = ref(false);

function formatTime(time: string) {
  return new Date(time + 'Z').toLocaleString('zh-CN');
}

function getDishImage(dishId: number | null) {
  if (!dishId) return '';
  const dish = dishStore.dishes.find(d => d.id === dishId);
  return dish?.image_url || '';
}

function goDish(dishId: number | null) {
  if (!dishId) return;
  router.push({ name: 'dish-detail', params: { id: dishId } });
}

onMounted(async () => {
  if (!dishStore.initialized) {
    await dishStore.fetchDishes();
  }
  if (!adminStore.isAdmin) {
    await adminStore.init();
  }
  try {
    const id = Number(route.params.id);
    order.value = await getOrder(id);
  } catch {
    // order will be null
  } finally {
    loading.value = false;
  }
});

function handleReject() {
  rejectReason.value = '';
  rejectCustomReason.value = '';
  showRejectDialog.value = true;
}

async function confirmReject() {
  if (!order.value) return;
  const reason = rejectReason.value === '其他'
    ? rejectCustomReason.value.trim()
    : rejectReason.value;
  if (!reason) {
    showToast('请选择或输入拒绝原因');
    return;
  }
  try {
    order.value = await updateOrderStatus(order.value.id, 3, reason);
    showRejectDialog.value = false;
    showToast('已拒绝接单');
  } catch (e: any) {
    showToast(e.message || '操作失败');
  }
}

async function handleUpdateStatus(status: number) {
  if (!order.value) return;
  try {
    order.value = await updateOrderStatus(order.value.id, status);
    showToast('状态已更新');
  } catch (e: any) {
    showToast(e.message || '更新失败');
  }
}

function openReviewDialog() {
  reviewRating.value = 5;
  reviewText.value = '';
  showReviewDialog.value = true;
}

async function submitReviewHandler() {
  if (!order.value) return;
  if (submittingReview.value) return;
  submittingReview.value = true;
  try {
    order.value = await submitReview(order.value.id, {
      rating: reviewRating.value,
      review: reviewText.value.trim() || undefined
    });
    showReviewDialog.value = false;
    showToast('评价成功');
  } catch (e: any) {
    showToast(e.message || '评价失败');
  } finally {
    submittingReview.value = false;
  }
}

async function handleShare() {
  if (!order.value) return;

  const lines = (order.value.items || []).map(
    item => `${item.dish_name} ×${item.quantity}  ¥${(item.dish_price * item.quantity).toFixed(2)}`
  );
  let text = `【蓉姐私房菜 - 新订单】\n${lines.join('\n')}`;
  if (order.value.remark) {
    text += `\n---\n备注：${order.value.remark}`;
  }
  text += `\n合计：¥${order.value.total_price.toFixed(2)}`;
  text += `\n---\n查看详情：${window.location.href}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: '蓉姐私房菜 - 订单', text });
    } catch {
      // cancelled
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      showToast('订单信息已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  }
}
</script>

<style scoped>
.detail-content {
  padding: var(--space-lg);
  padding-bottom: 80px;
}

.status-progress {
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-card);
}

.progress-rejected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-base);
  color: var(--color-text-placeholder);
  font-weight: var(--font-weight-medium);
  padding: var(--space-sm) 0;
}

.section-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-card);
}

.section-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.section-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.section-value--danger {
  color: var(--color-danger);
}

.section-header {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.dish-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.dish-row--clickable {
  cursor: pointer;
  border-radius: var(--radius-md);
  margin: 0 calc(-1 * var(--space-sm));
  padding: var(--space-sm);
  transition: background 0.15s;
}

.dish-row--clickable:active {
  background: var(--color-bg-input);
}

.dish-row-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.dish-row-thumb--empty {
  background: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dish-row-info {
  flex: 1;
  min-width: 0;
}

.dish-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.dish-row-name {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  margin-right: var(--space-sm);
}

.dish-row-subtotal {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.dish-row-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-row-unit {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.dish-row-qty {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.order-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-sm) 0;
}

.order-summary {
  padding-top: var(--space-sm);
}

.summary-remark {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}

.summary-remark .van-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.summary-price {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-price);
}

.order-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-card);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.order-actions .van-button {
  flex: 1;
}

/* 拒绝接单弹窗 */
.reject-form {
  padding: var(--space-sm) 0 0;
}

.reject-option {
  padding: var(--space-sm) var(--space-lg);
}

.reject-actions {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
}

/* 评价 */
.review-entry {
  text-align: center;
}

.review-entry .van-button .van-icon {
  margin-right: var(--space-xs);
}

.review-stars {
  padding: var(--space-sm) 0;
}

.review-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

.review-form {
  padding: var(--space-sm) 0 0;
}

.review-form-rating {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
}

.review-form-label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.review-form-actions {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
}
</style>