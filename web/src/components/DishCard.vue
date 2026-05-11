<script setup lang="ts">
import type { Dish } from '@/types';

interface Props {
  dish: Dish;
  showActions?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit', dish: Dish): void;
  (e: 'delete', dish: Dish): void;
}>();
</script>

<template>
  <div class="dish-card">
    <div class="dish-thumb">
      <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" class="dish-image" />
      <div v-else class="dish-placeholder">暂无图片</div>
    </div>
    <div class="dish-content">
      <div class="dish-header">
        <span class="dish-name">{{ dish.name }}</span>
        <span class="dish-price">¥{{ dish.price.toFixed(2) }}</span>
      </div>
      <div class="dish-desc">{{ dish.description || '暂无描述' }}</div>
      <div v-if="showActions" class="dish-actions">
        <button class="action-btn edit" @click="emit('edit', dish)">编辑</button>
        <button class="action-btn delete" @click="emit('delete', dish)">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dish-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.dish-thumb {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
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
  background: #f7f8fa;
  color: #969799;
  font-size: 12px;
}

.dish-content {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.dish-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dish-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.dish-price {
  color: #ee0a24;
  font-weight: 600;
  font-size: 16px;
}

.dish-desc {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dish-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.action-btn.edit {
  background: #1989fa;
  color: #fff;
}

.action-btn.delete {
  background: #ee0a24;
  color: #fff;
}
</style>