<template>
  <div class="image-uploader">
    <input ref="fileInput" type="file" accept="image/*" style="display: none" :disabled="loading" @change="handleFileChange" />
    <div
      v-if="!previewUrl && !localPreviewUrl"
      class="upload-placeholder"
      :class="{ disabled: loading }"
      @click="!loading && handleClick()"
    >
      <span class="upload-icon">+</span>
      <span class="upload-text">上传图片</span>
    </div>
    <div v-else class="preview-container">
      <img :src="localPreviewUrl || previewUrl" alt="preview" class="preview-image" />
      <div v-if="loading" class="loading-overlay">
        <VanLoading type="spinner" color="#fff" size="20" />
      </div>
      <div v-if="!loading" class="remove-btn" @click="handleRemove">×</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import imageCompression from 'browser-image-compression';
import { Loading as VanLoading } from 'vant';
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
const localPreviewUrl = ref('');

watch(
  () => props.imageUrl,
  newUrl => {
    previewUrl.value = newUrl || '';
  }
);

function handleClick() {
  fileInput.value?.click();
}

function handleRemove(e: Event) {
  e.stopPropagation();
  previewUrl.value = '';
  emit('remove');
}

async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8
  });
  return new File([compressed], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' });
}

async function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Check file type
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    alert('只支持 JPG、PNG、GIF、WebP 格式');
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }

  loading.value = true;
  localPreviewUrl.value = URL.createObjectURL(file);
  try {
    const compressed = await compressImage(file);
    const res = await uploadImage(compressed);
    previewUrl.value = res.url;
    localPreviewUrl.value = '';
    emit('upload', res.url);
  } catch (err: any) {
    localPreviewUrl.value = '';
    alert(err.message || '上传失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.image-uploader {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.upload-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border);
  cursor: pointer;
}

.upload-placeholder.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 24px;
  color: var(--color-text-placeholder);
}

.upload-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: var(--space-xs);
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
  border-radius: var(--radius-sm);
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
  border-radius: var(--radius-sm);
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: var(--color-text-inverse);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}
</style>
