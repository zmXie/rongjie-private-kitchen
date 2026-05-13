<template>
  <div class="loading-state">
    <Loading type="spinner" size="24px">{{ text }}</Loading>
  </div>
</template>

<script setup lang="ts">
import { Loading } from 'vant';

withDefaults(defineProps<{ text?: string }>(), { text: '加载中...' });
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
}
</style>
