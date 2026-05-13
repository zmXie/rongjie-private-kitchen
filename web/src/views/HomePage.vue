<template>
  <div class="home-page">
    <NavBar title="蓉姐私房菜" :border="true">
      <template #right>
        <VanButton v-if="!isAdmin" size="small" type="primary" plain @click="handleLogin">管理</VanButton>
        <VanButton v-else size="small" type="warning" plain @click="handleLogout">退出</VanButton>
      </template>
    </NavBar>

    <Tabs v-model:active="activeCategoryId" shrink swipeable @change="onCategoryChange" class="sticky-tabs">
      <Tab v-for="category in categoryStore.sortedCategories" :key="category.id" :title="category.name" :name="category.id" />
    </Tabs>

    <div class="tab-content">
      <div v-if="isAdmin" class="admin-category-controls">
        <VanButton size="small" type="primary" plain @click="handleAddCategory">新增分类</VanButton>
        <VanButton size="small" plain @click="handleEditCategory">编辑</VanButton>
        <VanButton size="small" type="danger" plain @click="handleDeleteCategory">删除</VanButton>
      </div>

      <LoadingState v-if="dishStore.loading" />
      <div v-else-if="currentDishes.length > 0" class="dish-list">
        <DishCard
          v-for="dish in currentDishes"
          :key="dish.id"
          :dish="dish"
          :showActions="isAdmin"
          @click="handleDishClick"
          @edit="handleEditDish"
          @delete="handleDeleteDish"
        />
      </div>
      <VanEmpty v-else description="暂无菜品" />

      <div v-if="isAdmin" class="admin-add-dish-fixed">
        <VanButton block type="primary" icon="plus" @click="handleAddDish">新增菜品</VanButton>
      </div>
    </div>

    <DishEditor
      v-model:visible="showDishEditor"
      :dish="editingDish"
      :categories="categoryStore.categories"
      :isAdmin="isAdmin"
      :nextSort="nextDishSort"
      @save="handleSaveDish"
      @close="showDishEditor = false"
    />

    <CategoryEditor
      v-model:visible="showCategoryEditor"
      :category="editingCategory"
      :nextSort="nextCategorySort"
      @save="handleSaveCategory"
      @close="showCategoryEditor = false"
    />

    <LoginDialog v-model:visible="showLoginDialog" @success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog, NavBar, Tab, Tabs, Button as VanButton, Empty as VanEmpty } from 'vant';
import { useCategoryStore } from '@/stores/categories';
import { useDishStore } from '@/stores/dishes';
import { useAdminStore } from '@/stores/admin';
import DishCard from '@/components/DishCard.vue';
import DishEditor from '@/components/DishEditor.vue';
import CategoryEditor from '@/components/CategoryEditor.vue';
import LoginDialog from '@/components/LoginDialog.vue';
import LoadingState from '@/components/LoadingState.vue';
import type { Dish } from '@/types';

const router = useRouter();
const categoryStore = useCategoryStore();
const dishStore = useDishStore();
const adminStore = useAdminStore();

const showDishEditor = ref(false);
const showCategoryEditor = ref(false);
const showLoginDialog = ref(false);
const editingDish = ref<any>(null);
const editingCategory = ref<any>(null);

const activeCategoryId = computed({
  get: () => categoryStore.activeCategoryId,
  set: val => {
    categoryStore.activeCategoryId = val;
  }
});

onMounted(async () => {
  await categoryStore.fetchCategories();
  await dishStore.fetchDishes();
  if (!activeCategoryId.value && categoryStore.categories.length > 0) {
    activeCategoryId.value = categoryStore.categories[0].id;
  }
});

const isAdmin = computed(() => adminStore.isAdmin);

const currentDishes = computed(() => {
  if (!activeCategoryId.value) return [];
  return dishStore.getDishesByCategory(Number(activeCategoryId.value));
});

const activeCategory = computed(() => {
  if (!activeCategoryId.value) return null;
  return categoryStore.categories.find(c => c.id === Number(activeCategoryId.value));
});

const nextDishSort = computed(() => {
  if (currentDishes.value.length === 0) return 0;
  return Math.max(...currentDishes.value.map(d => d.sort)) + 1;
});

const nextCategorySort = computed(() => {
  if (categoryStore.categories.length === 0) return 0;
  return Math.max(...categoryStore.categories.map(c => c.sort)) + 1;
});

function onCategoryChange(name: string | number) {
  activeCategoryId.value = typeof name === 'string' ? Number(name) : name;
}

function handleAddDish() {
  editingDish.value = null;
  showDishEditor.value = true;
}

function handleEditDish(dish: any) {
  editingDish.value = dish;
  showDishEditor.value = true;
}

async function handleDeleteDish(dish: any) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除菜品「${dish.name}」吗？`
    });
    await dishStore.removeDish(dish.id);
    showToast('删除成功');
  } catch {
    // User cancelled
  }
}

async function handleSaveDish(data: any) {
  try {
    if (editingDish.value) {
      await dishStore.editDish(editingDish.value.id, data);
      showToast('更新成功');
    } else {
      await dishStore.addDish(data);
      showToast('添加成功');
    }
    showDishEditor.value = false;
  } catch (e: any) {
    showToast(e.message);
  }
}

function handleAddCategory() {
  editingCategory.value = null;
  showCategoryEditor.value = true;
}

function handleEditCategory() {
  if (!activeCategory.value) return;
  editingCategory.value = activeCategory.value;
  showCategoryEditor.value = true;
}

async function handleDeleteCategory() {
  if (!activeCategory.value) return;
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除分类「${activeCategory.value.name}」吗？该操作将同时删除该分类下的所有菜品。`
    });
    await categoryStore.removeCategory(activeCategory.value.id);
    await dishStore.fetchDishes();
    showToast('删除成功');
  } catch {
    // User cancelled
  }
}

async function handleSaveCategory(data: { name: string; sort: number }) {
  try {
    if (editingCategory.value) {
      await categoryStore.editCategory(editingCategory.value.id, data.name, data.sort);
      showToast('更新成功');
    } else {
      await categoryStore.addCategory(data.name, data.sort);
      showToast('添加成功');
    }
    showCategoryEditor.value = false;
  } catch (e: any) {
    showToast(e.message);
  }
}

function handleLogout() {
  adminStore.logout();
}

function handleLogin() {
  showLoginDialog.value = true;
}

function handleLoginSuccess() {
  adminStore.setAdmin(true);
}

function handleDishClick(dish: Dish) {
  router.push({ name: 'dish-detail', params: { id: dish.id } });
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.sticky-tabs {
  position: sticky;
  top: 46px;
  z-index: 99;
}

.admin-category-controls {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-sm);
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.admin-add-dish-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0px));
  background: var(--color-bg-card);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 50;
}

.tab-content {
  padding: var(--space-md);
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  min-height: 50vh;
}
</style>
