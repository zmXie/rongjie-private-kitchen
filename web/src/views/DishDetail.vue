<template>
  <PageContainer title="菜品详情" left-arrow :border="false" :loading="!dishStore.initialized" @click-left="onClickLeft">
    <template #nav-right>
      <VanIcon name="share-o" size="20" color="var(--color-text-primary)" @click="handleShare" />
    </template>

    <template v-if="dish">
      <div class="detail-hero">
        <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" class="hero-image" @click="showPreview" />
        <div v-else class="hero-placeholder">
          <VanIcon name="photo-o" size="64" color="var(--color-text-placeholder)" />
        </div>
        <div v-if="dish.is_sold_out" class="hero-sold-out-overlay">
          <span class="sold-out-text">售罄</span>
        </div>
      </div>

      <div class="detail-info">
        <div class="detail-name">
          {{ dish.name }}
          <VanTag v-if="dish.is_recommended" type="danger" size="medium">招牌</VanTag>
          <VanTag v-if="dish.is_sold_out" color="#636e72" size="medium">今日售罄</VanTag>
        </div>
        <div class="detail-meta">
          <VanTag plain type="primary">{{ categoryName }}</VanTag>
          <span class="detail-price" :class="{ 'price-sold-out': dish.is_sold_out }">¥{{ dish.price.toFixed(2) }}</span>
        </div>
        <div class="detail-desc">
          <div class="desc-title">菜品介绍</div>
          <p>{{ dish.description || '暂无描述' }}</p>
        </div>
      </div>
    </template>

    <VanEmpty v-else description="菜品不存在" />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon as VanIcon, Tag as VanTag, Empty as VanEmpty, showImagePreview, showToast } from 'vant';
import { useDishStore } from '@/stores/dishes';
import { useCategoryStore } from '@/stores/categories';
import PageContainer from '@/components/PageContainer.vue';

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

function showPreview() {
  if (dish.value?.image_url) {
    showImagePreview([dish.value.image_url]);
  }
}

async function handleShare() {
  const url = window.location.href;
  const title = dish.value ? `${dish.value.name} - 蓉姐私房菜` : '蓉姐私房菜';

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      // User cancelled
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      showToast('链接已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  }
}
</script>

<style scoped>
.detail-hero {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-bg-input);
  position: relative;
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

.hero-sold-out-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-sold-out-overlay .sold-out-text {
  color: #fff;
  font-size: 28px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 6px;
  border: 2px solid #fff;
  border-radius: var(--radius-md);
  padding: 4px 20px;
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
  display: flex;
  align-items: center;
  gap: var(--space-sm);
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

.price-sold-out {
  text-decoration: line-through;
  color: var(--color-text-placeholder);
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
