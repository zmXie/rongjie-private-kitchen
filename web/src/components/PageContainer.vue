<template>
  <div class="page-container">
    <NavBar :title="title" :left-arrow="leftArrow" :border="border" @click-left="$emit('clickLeft')">
      <template v-if="$slots['nav-left']" #left>
        <slot name="nav-left" />
      </template>
      <template v-if="$slots['nav-right']" #right>
        <slot name="nav-right" />
      </template>
    </NavBar>

    <div class="page-body">
      <LoadingState v-if="loading" />
      <slot v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar } from 'vant';
import LoadingState from '@/components/LoadingState.vue';

withDefaults(defineProps<{
  title: string;
  loading?: boolean;
  leftArrow?: boolean;
  border?: boolean;
}>(), {
  loading: false,
  leftArrow: false,
  border: true,
});

defineEmits<{ clickLeft: [] }>();
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.page-body {
  position: relative;
  min-height: calc(100vh - 48px);
}

.page-body:has(> .loading-state) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
