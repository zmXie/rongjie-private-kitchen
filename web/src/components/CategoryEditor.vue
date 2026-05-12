<script setup lang="ts">
import { ref, watch } from 'vue';
import { showToast, Popup as VanPopup, Field as VanField, Button as VanButton } from 'vant';
import type { Category } from '@/types';

interface Props {
  visible: boolean;
  category?: Category | null;
  nextSort?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: { name: string; sort: number }): void;
}>();

const form = ref({
  name: '',
  sort: 0,
});

watch(
  () => props.visible,
  val => {
    if (val && props.category) {
      form.value.name = props.category.name;
      form.value.sort = props.category.sort;
    } else if (val) {
      form.value.name = '';
      form.value.sort = props.nextSort ?? 0;
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
  <VanPopup
    :show="visible"
    position="bottom"
    round
    closeable
    close-icon="cross"
    :style="{ maxHeight: '70vh' }"
    @close="emit('close')"
  >
    <div class="category-editor">
      <div class="editor-header">{{ category ? '编辑分类' : '新增分类' }}</div>

      <div class="editor-body">
        <VanField
          v-model="form.name"
          label="分类名称"
          placeholder="请输入分类名称"
          input-align="right"
        />
        <VanField
          v-model.number="form.sort"
          label="排序"
          type="digit"
          placeholder="数值越小越靠前"
          input-align="right"
        />
      </div>

      <div class="editor-footer">
        <VanButton block @click="emit('close')">取消</VanButton>
        <VanButton block type="primary" @click="handleSave">保存</VanButton>
      </div>
    </div>
  </VanPopup>
</template>

<style scoped>
.category-editor {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
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
