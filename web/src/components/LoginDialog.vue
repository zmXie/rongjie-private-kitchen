<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, Field, Button as VanButton } from 'vant';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'success'): void;
}>();

const secret = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');

watch(() => props.visible, (val) => {
  if (val) {
    const saved = localStorage.getItem('admin-secret');
    secret.value = saved || '';
    showPassword.value = false;
    loading.value = false;
    errorMsg.value = '';
  }
});

async function handleConfirm() {
  if (!secret.value.trim()) {
    errorMsg.value = '请输入管理员密钥';
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  try {
    const res = await fetch('/api/admin/check', {
      headers: { 'x-admin-secret': secret.value.trim() },
    });

    if (res.ok) {
      localStorage.setItem('admin-secret', secret.value.trim());
      emit('update:visible', false);
      emit('success');
    } else {
      errorMsg.value = '密钥错误，请重试';
    }
  } catch {
    errorMsg.value = '网络错误，请重试';
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    :show="visible"
    title="管理员登录"
    :show-confirm-button="false"
    :close-on-click-overlay="true"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <div class="login-form">
      <Field
        v-model="secret"
        :type="showPassword ? 'text' : 'password'"
        placeholder="请输入管理员密钥"
        :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
        @click-right-icon="showPassword = !showPassword"
        @keydown.enter="handleConfirm"
      />
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div class="login-actions">
        <VanButton block @click="handleCancel">取消</VanButton>
        <VanButton block type="primary" :loading="loading" @click="handleConfirm">确定</VanButton>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.login-form {
  padding: var(--space-sm) 0 0;
}

.error-msg {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-lg);
}

.login-actions {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
}
</style>
