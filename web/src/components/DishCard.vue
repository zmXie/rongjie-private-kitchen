<template>
  <div class="dish-card" :class="{ 'is-sold-out': dish.is_sold_out }" @click="emit('click', dish)">
    <div class="dish-thumb">
      <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" class="dish-image" loading="lazy" decoding="async" />
      <div v-else class="dish-placeholder">
        <VanIcon name="photo-o" size="32" color="var(--color-text-placeholder)" />
      </div>
      <div v-if="dish.is_sold_out" class="dish-sold-out-overlay">
        <span class="sold-out-text">售罄</span>
      </div>
    </div>
    <div class="dish-content">
      <div class="dish-name">
        {{ dish.name }}
        <span v-if="dish.is_recommended && !dish.is_sold_out" class="dish-recommend">
          推荐
          <VanIcon name="good-job" size="12" color="var(--color-primary)" />
        </span>
      </div>
      <div class="dish-desc">{{ dish.description || '暂无描述' }}</div>
      <div class="dish-footer">
        <span class="dish-price" :class="{ 'price-sold-out': dish.is_sold_out }">¥{{ dish.price.toFixed(2) }}</span>
        <div v-if="showActions" class="dish-actions" @click.stop>
          <VanButton size="mini" type="primary" plain @click="emit('edit', dish)">编辑</VanButton>
          <VanButton size="mini" type="danger" plain @click="emit('delete', dish)">删除</VanButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button as VanButton, Icon as VanIcon } from 'vant';
import type { Dish } from '@/types';

interface Props {
  dish: Dish;
  showActions?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'edit', dish: Dish): void;
  (e: 'delete', dish: Dish): void;
  (e: 'click', dish: Dish): void;
}>();
</script>

<style scoped>
.dish-card {
  display: flex;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.15s ease;
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-card.is-sold-out {
  opacity: 0.7;
}

.dish-thumb {
  flex-shrink: 0;
  width: 140px;
  height: 120px;
  overflow: hidden;
  background: var(--color-bg-input);
  position: relative;
}

.dish-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dish-sold-out-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.sold-out-text {
  color: #fff;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 4px;
  border: 2px solid #fff;
  border-radius: var(--radius-sm);
  padding: 2px 12px;
}

.dish-content {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dish-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.dish-recommend {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  background: var(--color-primary-bg);
  padding: 1px 6px;
  border-radius: 99px;
  line-height: 18px;
}

.dish-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-top: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: var(--space-sm);
}

.dish-price {
  color: var(--color-price);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.price-sold-out {
  text-decoration: line-through;
  color: var(--color-text-placeholder);
}

.dish-actions {
  display: flex;
  gap: var(--space-xs);
}
</style>
