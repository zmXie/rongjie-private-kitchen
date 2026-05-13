<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
:root {
  /* 主色 - 暖红色，适合餐饮 */
  --color-primary: #c0392b;
  --color-primary-light: #e74c3c;
  --color-primary-dark: #a93226;
  --color-primary-bg: #fdf2f0;

  /* 强调色 / 管理 */
  --color-accent: #e67e22;
  --color-accent-light: #f39c12;
  --color-accent-bg: #fef5e7;

  /* 危险色 */
  --color-danger: #d63031;
  --color-danger-bg: #ffeaea;

  /* 文字 */
  --color-text-primary: #2d3436;
  --color-text-secondary: #636e72;
  --color-text-placeholder: #b2bec3;
  --color-text-inverse: #ffffff;

  /* 背景 */
  --color-bg-page: #f5f1ed;
  --color-bg-card: #ffffff;
  --color-bg-input: #f8f6f3;

  /* 边框 */
  --color-border: #e8e2db;
  --color-border-light: #f0ebe4;

  /* 阴影 */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 4px 20px rgba(0, 0, 0, 0.1);

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;

  /* 字号 */
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-lg: 17px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* 价格色 */
  --color-price: #c0392b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}

body {
  overflow-x: hidden;
}

/* NavBar 通用固定布局 */
.van-nav-bar {
  position: sticky !important;
  top: 0;
  z-index: 100 !important;
}
</style>
