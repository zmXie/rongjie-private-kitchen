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

<template>
  <div class="dish-card" @click="emit('click', dish)">
    <div class="dish-thumb">
      <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" class="dish-image" loading="lazy" decoding="async" />
      <div v-else class="dish-placeholder">
        <VanIcon name="photo-o" size="32" color="var(--color-text-placeholder)" />
      </div>
    </div>
    <div class="dish-content">
      <div class="dish-name">{{ dish.name }}</div>
      <div class="dish-desc">{{ dish.description || '暂无描述' }}</div>
      <div class="dish-footer">
        <span class="dish-price">¥{{ dish.price.toFixed(2) }}</span>
        <div v-if="showActions" class="dish-actions" @click.stop>
          <VanButton size="mini" type="primary" plain @click="emit('edit', dish)">编辑</VanButton>
          <VanButton size="mini" type="danger" plain @click="emit('delete', dish)">删除</VanButton>
        </div>
      </div>
    </div>
  </div>
</template>

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

.dish-thumb {
  flex-shrink: 0;
  width: 140px;
  height: 120px;
  overflow: hidden;
  background: var(--color-bg-input);
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

.dish-actions {
  display: flex;
  gap: var(--space-xs);
}
</style>
