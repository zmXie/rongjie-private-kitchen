# 开发规范

## 代码风格

- TypeScript + Vue 3 Composition API（`<script setup lang="ts">`）
- vue 文件中 template 放在顶部，script 次之，style 末尾
- 异步操作使用 `async/await`，不用 `.then()/.catch()`
- API 响应已由拦截器解包，直接使用返回的 `data`

## 命名规范

Git 提交规范使用 `/auto-commit` skill。

| 类型       | 规则             | 示例              |
| ---------- | ---------------- | ----------------- |
| 组件文件   | PascalCase       | `DishCard.vue`    |
| 视图文件   | PascalCase       | `HomePage.vue`    |
| 组合式函数 | use + Pascal     | `useApi.ts`       |
| Store      | camelCase        | `dishes.ts`       |
| API 模块   | camelCase        | `dishes.ts`       |
| 类型文件   | index.ts         | `types/index.ts`  |
| 变量       | camelCase        | `dishList`        |
| 方法       | handle + camel   | `handleDelete`    |

## 样式规范

- 使用 `<style scoped lang="scss">`
- CSS 类名使用小写 + 连字符（如 `dish-card`）
- 移动端优先，使用 Vant 4 的响应式和适配能力
- 图片使用 `browser-image-compression` 压缩后上传
