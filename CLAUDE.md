# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

蓉姐私房菜 — 响应式 H5 菜单展示网站。Vue 3 前端 + Hono 后端 monorepo，全栈部署在 Cloudflare（Pages + Workers + D1 + R2）。

## 常用命令

```bash
npm install            # 安装所有 workspace 依赖
npm dev:web            # 启动前端开发服务器（端口 3000，代理 /api → 8787）
npm dev:api            # 启动后端开发服务器（端口 8787，Wrangler）
npm build              # 构建所有 workspace
npm deploy             # 一键部署（前端 + 后端）
npm deploy:init        # 首次初始化基础设施（D1、R2、密钥）
npm deploy:web         # 仅部署前端
npm deploy:api         # 仅部署后端
```

项目未配置测试框架和代码检查工具。

## 架构

npm workspaces monorepo（`web` + `api`），根目录 `package.json` 脚本委托给各 workspace。

### 前端 (`web/`)

- Vue 3 + Vite + TypeScript + Vant 4（移动端 UI 库）
- Pinia stores：`admin`（认证状态）、`categories`、`dishes`
- 单页应用，仅一个路由（`/` → `HomePage.vue`）
- API 层：`src/api/index.ts` 创建 Axios 实例，baseURL 为 `/api`，自动附加 `x-admin-secret` 请求头（从 localStorage 读取），拦截器解包 `{code, message, data}` 响应
- 组合式函数：`useApi`（带类型的 CRUD 封装）、`useAdmin`（登录弹窗 + 密钥验证）
- 管理模式：通过登录弹窗触发（不再使用 URL 参数），密钥存于 localStorage，以 `x-admin-secret` 请求头发送
- 路径别名：`@` → `src/`

### 后端 (`api/`)

- 单文件架构：`src/index.ts`，所有路由集中在一个 Hono 应用中
- Cloudflare Workers 绑定：`DB`（D1）、`IMAGES`（R2）、`ADMIN_SECRET`（secret）、`PUBLIC_R2_URL`（var）
- 路由以 `/api/` 为前缀，另有 `/r2/:filename` 直接提供图片访问
- Zod schema 通过 `@hono/zod-validator` 校验请求体
- `adminAuth` 中间件校验 `x-admin-secret` 请求头与 `ADMIN_SECRET` 绑定值
- 响应格式：成功 `{code: 0, message, data}`，失败 `{code: 1, message, data: null}`
- 删除分类会级联删除该分类下所有菜品

### 数据库 (`database/`)

- `init.sql`：创建 `categories` 和 `dishes` 表及索引，插入种子数据
- D1（SQLite）— `categories.id` 自增，`dishes.category_id` 外键设 `ON DELETE CASCADE`

### 部署 (`deploy.js`)

- 根目录 Node.js 脚本，处理基础设施初始化、前端部署（Wrangler Pages）、后端部署（Wrangler Workers）
- Wrangler 配置位于 `api/wrangler.toml`，包含 D1 数据库 ID 和 R2 存储桶绑定

## 关键约定

- API 响应统一使用 `{code, message, data}` 格式，前端拦截器自动解包为 `data`
- 管理接口需要 `x-admin-secret` 请求头，公共接口（GET categories/dishes、health）不需要
- 图片通过 `POST /api/upload` 上传至 R2，通过 `/r2/:filename`（或自定义 R2 域名）访问
- 所有 API 路由使用 `/api` 前缀，Vite 开发代理将 `/api` 转发至 8787 端口的 Wrangler 开发服务器
- 分类和菜品按 `sort ASC, id ASC` 排序
- vue文件中的 template 应该放在顶部
