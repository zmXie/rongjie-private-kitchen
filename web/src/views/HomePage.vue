<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import { useCategoryStore } from '@/stores/categories';
import { useDishStore } from '@/stores/dishes';
import { useAdminStore } from '@/stores/admin';
import DishCard from '@/components/DishCard.vue';
import DishEditor from '@/components/DishEditor.vue';
import CategoryEditor from '@/components/CategoryEditor.vue';
import { useAdmin } from '@/composables/useAdmin';

const categoryStore = useCategoryStore();
const dishStore = useDishStore();
const adminStore = useAdminStore();
const adminUtils = useAdmin();

const activeCategoryId = ref<number | null>(null);
const showDishEditor = ref(false);
const showCategoryEditor = ref(false);
const editingDish = ref<any>(null);
const editingCategory = ref<any>(null);

onMounted(async () => {
  adminStore.init();
  await categoryStore.fetchCategories();
  await dishStore.fetchDishes();
  if (categoryStore.categories.length > 0) {
    activeCategoryId.value = categoryStore.categories[0].id;
  }
});

const isAdmin = computed(() => adminStore.isAdmin);

const currentDishes = computed(() => {
  if (!activeCategoryId.value) return [];
  return dishStore.getDishesByCategory(activeCategoryId.value);
});

function onCategoryChange(name: string | number) {
  activeCategoryId.value = name as number;
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
      message: `确定要删除菜品「${dish.name}」吗？`,
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

function handleEditCategory(category: any) {
  editingCategory.value = category;
  showCategoryEditor.value = true;
}

async function handleDeleteCategory(category: any) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除分类「${category.name}」吗？该操作将同时删除该分类下的所有菜品。`,
    });
    await categoryStore.removeCategory(category.id);
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
  showConfirmDialog({
    title: '退出管理模式',
    message: '确定要退出管理模式吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    adminStore.logout();
  }).catch(() => {});
}

async function handleLogin() {
  const result = await adminUtils.showLoginPrompt();
  if (result.error) {
    showToast(result.error);
  } else if (result.secret) {
    adminStore.setAdmin(true);
  }
}
</script>

<template>
  <div class="home-page">
    <div class="navbar">
      <span class="title">蓉姐私房菜</span>
      <button v-if="!isAdmin" class="admin-entry-btn" @click="handleLogin">管理</button>
    </div>

    <!-- Admin Mode Banner -->
    <div v-if="isAdmin" class="admin-banner">
      <span>管理模式</span>
      <button class="logout-btn" @click="handleLogout">退出</button>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <div
        v-for="category in categoryStore.sortedCategories"
        :key="category.id"
        class="tab-item"
        :class="{ active: activeCategoryId === category.id }"
        @click="onCategoryChange(category.id)"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Admin Controls for Category -->
      <div v-if="isAdmin" class="admin-category-controls">
        <button class="btn btn-primary" @click="handleAddCategory">新增分类</button>
        <button class="btn" @click="handleEditCategory(categoryStore.sortedCategories.find(c => c.id === activeCategoryId) || {})">编辑</button>
        <button class="btn btn-danger" @click="handleDeleteCategory(categoryStore.sortedCategories.find(c => c.id === activeCategoryId) || {})">删除</button>
      </div>

      <!-- Dish List -->
      <div v-if="currentDishes.length > 0" class="dish-list">
        <DishCard
          v-for="dish in currentDishes"
          :key="dish.id"
          :dish="dish"
          :showActions="isAdmin"
          @edit="handleEditDish"
          @delete="handleDeleteDish"
        />
      </div>
      <div v-else class="empty-state">
        <span>暂无菜品</span>
      </div>

      <!-- Admin Add Dish Button -->
      <div v-if="isAdmin" class="admin-add-dish">
        <button class="btn btn-primary btn-block" @click="handleAddDish">新增菜品</button>
      </div>
    </div>

    <!-- Dish Editor Popup -->
    <DishEditor
      v-model:visible="showDishEditor"
      :dish="editingDish"
      :categories="categoryStore.categories"
      :isAdmin="isAdmin"
      @save="handleSaveDish"
      @close="showDishEditor = false"
    />

    <!-- Category Editor Popup -->
    <CategoryEditor
      v-model:visible="showCategoryEditor"
      :category="editingCategory"
      @save="handleSaveCategory"
      @close="showCategoryEditor = false"
    />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  flex: 1;
  text-align: center;
}

.admin-entry-btn {
  padding: 4px 12px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.admin-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #fff3e0;
  color: #fa8c16;
  font-size: 14px;
}

.logout-btn {
  padding: 4px 12px;
  background: #fa8c16;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  background: #fff;
  border-bottom: 1px solid #ebedf0;
  -webkit-overflow-scrolling: touch;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex-shrink: 0;
  padding: 12px 16px;
  font-size: 14px;
  color: #646566;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab-item.active {
  color: #1989fa;
  border-bottom-color: #1989fa;
}

.tab-content {
  padding: 12px;
  min-height: 50vh;
}

.admin-category-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f7f8fa;
  border-radius: 8px;
}

.dish-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #969799;
}

.admin-add-dish {
  margin-top: 16px;
  padding: 12px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  color: #323233;
}

.btn-primary {
  background: #1989fa;
  color: #fff;
}

.btn-danger {
  background: #ee0a24;
  color: #fff;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}
</style>