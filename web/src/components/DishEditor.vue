<template>
  <VanPopup :show="visible" position="bottom" round closeable close-icon="cross" :style="{ maxHeight: '85vh' }" @close="emit('close')">
    <div class="dish-editor">
      <div class="editor-header">{{ dish ? '编辑菜品' : '新增菜品' }}</div>
      <div class="editor-body">
        <VanField
          v-model="selectedCategoryName"
          is-link
          readonly
          label="分类"
          placeholder="请选择分类"
          input-align="left"
          @click="showCategoryPicker = true"
        />
        <VanField v-model="form.name" label="菜品名称" placeholder="请输入菜品名称" input-align="left" />
        <VanField
          v-model="form.description"
          label="描述"
          type="textarea"
          placeholder="请输入菜品描述"
          input-align="left"
          rows="2"
          autosize
        />
        <VanField v-model.number="form.price" label="价格" type="number" placeholder="请输入价格" input-align="left" />
        <VanField v-model.number="form.sort" label="排序" type="digit" placeholder="数值越小越靠前" input-align="left" />
        <VanCell title="招牌推荐" center>
          <template #right-icon>
            <VanSwitch v-model="form.is_recommended" size="20px" active-color="#c0392b" />
          </template>
        </VanCell>
        <VanCell title="今日售罄" center>
          <template #right-icon>
            <VanSwitch v-model="form.is_sold_out" size="20px" active-color="#636e72" />
          </template>
        </VanCell>
        <div class="form-item-image">
          <div class="image-label">菜品图片</div>
          <ImageUploader :imageUrl="form.image_url" :isAdmin="isAdmin" @upload="handleImageUploaded" @remove="form.image_url = ''" />
        </div>
      </div>

      <div class="editor-footer">
        <VanButton block @click="emit('close')">取消</VanButton>
        <VanButton block type="primary" @click="handleSave">保存</VanButton>
      </div>
    </div>
  </VanPopup>

  <VanPopup :show="showCategoryPicker" round position="bottom" @close="showCategoryPicker = false">
    <VanPicker
      :columns="categoryColumns"
      :model-value="[form.category_id]"
      @confirm="onCategoryConfirm"
      @cancel="showCategoryPicker = false"
    />
  </VanPopup>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  showToast,
  Popup as VanPopup,
  Field as VanField,
  Button as VanButton,
  Picker as VanPicker,
  Cell as VanCell,
  Switch as VanSwitch
} from 'vant';
import type { Dish, Category } from '@/types';
import ImageUploader from './ImageUploader.vue';

interface Props {
  visible: boolean;
  dish?: Dish | null;
  categories: Category[];
  isAdmin?: boolean;
  nextSort?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'save',
    data: {
      category_id: number;
      name: string;
      description: string;
      price: number;
      image_url: string;
      sort: number;
      is_recommended: number;
      is_sold_out: number;
    }
  ): void;
}>();

const form = ref({
  category_id: 0,
  name: '',
  description: '',
  price: 0,
  image_url: '',
  sort: 0,
  is_recommended: false,
  is_sold_out: false
});

const showCategoryPicker = ref(false);

const categoryColumns = computed(() => props.categories.map(c => ({ text: c.name, value: c.id })));

const selectedCategoryName = computed(() => {
  const cat = props.categories.find(c => c.id === form.value.category_id);
  return cat?.name ?? '';
});

watch(
  () => props.visible,
  val => {
    if (val && props.dish) {
      form.value = {
        category_id: props.dish.category_id,
        name: props.dish.name,
        description: props.dish.description || '',
        price: props.dish.price,
        image_url: props.dish.image_url || '',
        sort: props.dish.sort,
        is_recommended: !!props.dish.is_recommended,
        is_sold_out: !!props.dish.is_sold_out
      };
    } else if (val && props.categories.length > 0) {
      form.value = {
        category_id: props.categories[0].id,
        name: '',
        description: '',
        price: 0,
        image_url: '',
        sort: props.nextSort ?? 0,
        is_recommended: false,
        is_sold_out: false
      };
    }
  }
);

function onCategoryConfirm({ selectedValues }: { selectedValues: number[] }) {
  if (selectedValues.length > 0) {
    form.value.category_id = selectedValues[0];
  }
  showCategoryPicker.value = false;
}

function handleImageUploaded(url: string) {
  form.value.image_url = url;
}

function handleSave() {
  if (!form.value.name.trim()) {
    showToast('请输入菜品名称');
    return;
  }
  if (form.value.price <= 0) {
    showToast('请输入有效价格');
    return;
  }
  if (!form.value.category_id) {
    showToast('请选择分类');
    return;
  }
  emit('save', {
    category_id: form.value.category_id,
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    price: form.value.price,
    image_url: form.value.image_url,
    sort: form.value.sort,
    is_recommended: form.value.is_recommended ? 1 : 0,
    is_sold_out: form.value.is_sold_out ? 1 : 0
  });
}
</script>

<style scoped>
.dish-editor {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.editor-header {
  flex-shrink: 0;
  padding: var(--space-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.editor-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.form-item-image {
  padding: var(--space-md) var(--space-lg);
}

.image-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.editor-footer {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-card);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0px));
}
</style>
