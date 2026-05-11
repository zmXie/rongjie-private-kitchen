<script setup lang="ts">
import { ref, watch } from 'vue';
import { showToast } from 'vant';
import type { Dish, Category } from '@/types';
import ImageUploader from './ImageUploader.vue';

interface Props {
  visible: boolean;
  dish?: Dish | null;
  categories: Category[];
  isAdmin?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: {
    category_id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    sort: number;
  }): void;
}>();

const form = ref({
  category_id: 0,
  name: '',
  description: '',
  price: 0,
  image_url: '',
  sort: 0,
});

watch(
  () => props.visible,
  (val) => {
    if (val && props.dish) {
      form.value = {
        category_id: props.dish.category_id,
        name: props.dish.name,
        description: props.dish.description || '',
        price: props.dish.price,
        image_url: props.dish.image_url || '',
        sort: props.dish.sort,
      };
    } else if (val && props.categories.length > 0) {
      form.value = {
        category_id: props.categories[0].id,
        name: '',
        description: '',
        price: 0,
        image_url: '',
        sort: 0,
      };
    }
  }
);

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
  });
}
</script>

<template>
  <div v-if="visible" class="popup-overlay" @click.self="emit('close')">
    <div class="dish-editor">
      <div class="editor-header">
        <span class="editor-title">{{ dish ? '编辑菜品' : '新增菜品' }}</span>
        <span class="close-btn" @click="emit('close')">×</span>
      </div>
      <div class="editor-form">
        <div class="form-item">
          <label>分类</label>
          <select v-model.number="form.category_id">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="form-item">
          <label>菜品名称</label>
          <input v-model="form.name" type="text" placeholder="请输入菜品名称" />
        </div>
        <div class="form-item">
          <label>描述</label>
          <textarea v-model="form.description" placeholder="请输入菜品描述" rows="2"></textarea>
        </div>
        <div class="form-item">
          <label>价格</label>
          <input v-model.number="form.price" type="number" placeholder="请输入价格" />
        </div>
        <div class="form-item">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" placeholder="数值越小越靠前" />
        </div>
        <div class="form-item">
          <label>菜品图片</label>
          <ImageUploader
            :imageUrl="form.image_url"
            :isAdmin="isAdmin"
            @upload="handleImageUploaded"
          />
        </div>
      </div>
      <div class="editor-actions">
        <button class="btn-cancel" @click="emit('close')">取消</button>
        <button class="btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dish-editor {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  max-height: 85vh;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;
}

.editor-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  font-size: 24px;
  color: #969799;
  cursor: pointer;
}

.editor-form {
  padding: 16px 0;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdee0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item textarea {
  resize: vertical;
}

.editor-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-cancel {
  background: #f7f8fa;
  color: #323233;
}

.btn-save {
  background: #1989fa;
  color: #fff;
}
</style>