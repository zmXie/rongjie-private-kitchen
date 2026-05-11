<script setup lang="ts">
import { ref, watch } from 'vue';
import { uploadImage } from '@/api/dishes';

interface Props {
  imageUrl?: string;
  isAdmin?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'upload', url: string): void;
  (e: 'remove'): void;
}>();

const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref(props.imageUrl || '');

watch(() => props.imageUrl, (newUrl) => {
  previewUrl.value = newUrl || '';
});

function handleClick() {
  fileInput.value?.click();
}

function handleRemove(e: Event) {
  e.stopPropagation();
  previewUrl.value = '';
  emit('remove');
}

async function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }

  // Check file type
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    alert('只支持 JPG、PNG、GIF、WebP 格式');
    return;
  }

  loading.value = true;
  try {
    const res = await uploadImage(file);
    previewUrl.value = res.url;
    emit('upload', res.url);
  } catch (err: any) {
    alert(err.message || '上传失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="image-uploader">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
    <div v-if="!previewUrl" class="upload-placeholder" @click="handleClick">
      <span class="upload-icon">+</span>
      <span class="upload-text">上传图片</span>
    </div>
    <div v-else class="preview-container">
      <img :src="previewUrl" alt="preview" class="preview-image" />
      <div v-if="loading" class="loading-overlay">
        <span>上传中...</span>
      </div>
      <div class="remove-btn" @click="handleRemove">×</div>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px dashed #dcdee0;
  cursor: pointer;
}

.upload-icon {
  font-size: 24px;
  color: #969799;
}

.upload-text {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.preview-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}
</style>