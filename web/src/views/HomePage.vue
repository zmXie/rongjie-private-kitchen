<template>
  <PageContainer title="蓉姐私房菜" :loading="!dataReady" :border="true">
    <template #nav-right>
      <div class="nav-right">
        <VanIcon v-if="!isAdmin" name="setting-o" size="22" color="var(--color-text-secondary)" @click="handleLogin" />
        <VanIcon v-else name="revoke" size="22" color="var(--color-text-secondary)" @click="handleLogout" />
      </div>
    </template>

    <Tabs v-model:active="activeCategoryId" shrink swipeable @change="onCategoryChange" class="sticky-tabs">
      <Tab v-for="category in categoryStore.sortedCategories" :key="category.id" :title="category.name" :name="category.id" />
    </Tabs>

    <div class="tab-content">
      <div v-if="isAdmin" class="admin-category-controls">
        <VanButton size="small" type="primary" plain @click="handleAddCategory">新增分类</VanButton>
        <VanButton size="small" plain @click="handleEditCategory">编辑</VanButton>
        <VanButton size="small" type="danger" plain @click="handleDeleteCategory">删除</VanButton>
      </div>

      <div v-if="currentDishes.length > 0" class="dish-list">
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

    <div v-if="hasContact" class="contact-fab" :class="{ 'with-admin-bar': isAdmin }" @click="showContactSheet = true">
      <VanIcon name="phone-o" size="22" color="#fff" />
    </div>

    <CartFab v-if="!isAdmin" />

    <VanActionSheet
      v-model:show="showContactSheet"
      :actions="contactActions"
      cancel-text="取消"
      close-on-click-action
      @select="onContactSelect"
    />

    <DishEditor
      v-model:visible="showDishEditor"
      :dish="editingDish"
      :currentCategoryId="Number(activeCategoryId)"
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

    <AppTabbar />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog, Tab, Tabs, Button as VanButton, Empty as VanEmpty, Icon as VanIcon, ActionSheet as VanActionSheet } from 'vant';
import { useCategoryStore } from '@/stores/categories';
import { useDishStore } from '@/stores/dishes';
import { useAdminStore } from '@/stores/admin';
import { getConfig } from '@/api/config';
import PageContainer from '@/components/PageContainer.vue';
import DishCard from '@/components/DishCard.vue';
import DishEditor from '@/components/DishEditor.vue';
import CategoryEditor from '@/components/CategoryEditor.vue';
import LoginDialog from '@/components/LoginDialog.vue';
import CartFab from '@/components/CartFab.vue';
import AppTabbar from '@/components/AppTabbar.vue';
import type { Dish } from '@/types';

const router = useRouter();
const categoryStore = useCategoryStore();
const dishStore = useDishStore();
const adminStore = useAdminStore();

const showDishEditor = ref(false);
const showCategoryEditor = ref(false);
const showLoginDialog = ref(false);
const showContactSheet = ref(false);
const editingDish = ref<any>(null);
const editingCategory = ref<any>(null);

const contactPhone = ref('');
const contactWechat = ref('');

const dataReady = computed(() => categoryStore.initialized && dishStore.initialized);

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
  try {
    const config = await getConfig();
    contactPhone.value = config.phone || '';
    contactWechat.value = config.wechat || '';
  } catch {
    // Config endpoint may not be available, ignore
  }
});

const isAdmin = computed(() => adminStore.isAdmin);

const hasContact = computed(() => contactPhone.value || contactWechat.value);

const contactActions = computed(() => {
  const actions: { name: string; contactType: string }[] = [];
  if (contactPhone.value) {
    actions.push({ name: `拨打电话 ${contactPhone.value}`, contactType: 'phone' });
  }
  if (contactWechat.value) {
    actions.push({ name: `复制微信号 ${contactWechat.value}`, contactType: 'wechat' });
  }
  return actions;
});

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

async function onContactSelect(action: { name: string; contactType: string }) {
  if (action.contactType === 'phone' && contactPhone.value) {
    window.location.href = `tel:${contactPhone.value}`;
  } else if (action.contactType === 'wechat' && contactWechat.value) {
    try {
      await navigator.clipboard.writeText(contactWechat.value);
      showToast('微信号已复制');
    } catch {
      showToast('复制失败，请手动复制');
    }
  }
}
</script>

<style scoped>
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
  bottom: 50px;
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
  padding-bottom: calc(130px + env(safe-area-inset-bottom, 0px));
  min-height: 50vh;
}

.contact-fab {
  position: fixed;
  right: var(--space-lg);
  bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(192, 57, 43, 0.4);
  z-index: 90;
  transition: transform 0.2s ease, bottom 0.2s ease;
}

.contact-fab:active {
  transform: scale(0.92);
}

.contact-fab.with-admin-bar {
  bottom: calc(130px + env(safe-area-inset-bottom, 0px));
}

.nav-right {
  display: flex;
  gap: var(--space-xs);
}
</style>
