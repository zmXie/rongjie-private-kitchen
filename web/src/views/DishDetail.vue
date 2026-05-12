<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NavBar, Icon as VanIcon, Tag as VanTag, Empty as VanEmpty } from 'vant';
import { useDishStore } from '@/stores/dishes';
import { useCategoryStore } from '@/stores/categories';

const route = useRoute();
const router = useRouter();
const dishStore = useDishStore();
const categoryStore = useCategoryStore();

onMounted(async () => {
  if (dishStore.dishes.length === 0) {
    await dishStore.fetchDishes();
  }
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
});

const dish = computed(() => {
  const id = Number(route.params.id);
  return dishStore.dishes.find(d => d.id === id);
});

const categoryName = computed(() => {
  if (!dish.value) return '';
  const cat = categoryStore.categories.find(c => c.id === dish.value!.category_id);
  return cat?.name ?? '';
});

function onClickLeft() {
  router.back();
}
</script>

<template>
  <div class="dish-detail-page">
    <NavBar
      title="菜品详情"
      left-arrow
      :border="false"
      @click-left="onClickLeft"
    />

    <template v-if="dish">
      <div class="detail-hero">
        <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" class="hero-image" />
        <div v-else class="hero-placeholder">
          <VanIcon name="photo-o" size="64" color="var(--color-text-placeholder)" />
        </div>
      </div>

      <div class="detail-info">
        <div class="detail-name">{{ dish.name }}</div>
        <div class="detail-meta">
          <VanTag plain type="primary">{{ categoryName }}</VanTag>
          <span class="detail-price">¥{{ dish.price.toFixed(2) }}</span>
        </div>
        <div class="detail-desc">
          <div class="desc-title">菜品介绍</div>
          <p>{{ dish.description || '暂无描述' }}</p>
        </div>
      </div>
    </template>

    <VanEmpty v-else description="菜品不存在" />
  </div>
</template>

<style scoped>
.dish-detail-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.detail-hero {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-bg-input);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-info {
  padding: var(--space-xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  margin-top: -20px;
  position: relative;
  min-height: 40vh;
}

.detail-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.detail-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.detail-price {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-price);
}

.detail-desc {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-lg);
}

.desc-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.detail-desc p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
</style>
