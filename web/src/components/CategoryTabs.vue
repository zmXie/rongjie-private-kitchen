<script setup lang="ts">
import { Tabs, Tab } from 'vant';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
  activeIndex: number;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:activeIndex', index: number): void;
}>();
</script>

<template>
  <Tabs :active="activeIndex" @update:active="emit('update:activeIndex', $event)" sticky shrink swipeable class="category-tabs">
    <Tab v-for="category in categories" :key="category.id" :title="category.name" :name="category.id" />
  </Tabs>
</template>

<style scoped>
.category-tabs {
  background: #fff;
}
</style>
