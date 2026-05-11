<script setup lang="ts">
import { ref, watch } from 'vue';
import { showToast } from 'vant';
import type { Category } from '@/types';

interface Props {
  visible: boolean;
  category?: Category | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: { name: string; sort: number }): void;
}>();

const form = ref({
  name: '',
  sort: 0
});

watch(
  () => props.visible,
  val => {
    if (val && props.category) {
      form.value.name = props.category.name;
      form.value.sort = props.category.sort;
    } else if (val) {
      form.value.name = '';
      form.value.sort = 0;
    }
  }
);

function handleSave() {
  if (!form.value.name.trim()) {
    showToast('请输入分类名称');
    return;
  }
  emit('save', { name: form.value.name.trim(), sort: form.value.sort });
}
</script>

<template>
  <div v-if="visible" class="popup-overlay" @click.self="emit('close')">
    <div class="category-editor">
      <div class="editor-header">
        <span class="editor-title">{{ category ? '编辑分类' : '新增分类' }}</span>
        <span class="close-btn" @click="emit('close')">×</span>
      </div>
      <div class="editor-form">
        <div class="form-item">
          <label>分类名称</label>
          <input v-model="form.name" type="text" placeholder="请输入分类名称" />
        </div>
        <div class="form-item">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" placeholder="数值越小越靠前" />
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

.category-editor {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
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

.form-item input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdee0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
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
