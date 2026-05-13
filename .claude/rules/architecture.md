# 架构说明

## Monorepo 结构

npm workspaces monorepo（`web` + `api`），根目录 `package.json` 脚本委托给各 workspace。

```text
├── web/                  # 前端 Vue 3 应用
├── api/                  # 后端 Hono 应用（Cloudflare Workers）
├── database/             # SQL 初始化和迁移脚本
├── deploy.js             # 一键部署脚本
└── package.json          # workspace 根配置
```

## 前端 (`web/`)

- Vue 3 + Vite + TypeScript + Vant 4（移动端 UI 库）
- Pinia stores：`admin`（认证状态）、`categories`、`dishes`
- 单页应用，仅一个路由（`/` → `HomePage.vue`），详情通过弹窗展示
- API 层：`src/api/index.ts` 创建 Axios 实例，baseURL `/api`，拦截器自动附加 `x-admin-secret` 并解包 `{code, message, data}`
- 组合式函数：`useApi`（带类型的 CRUD 封装）、`useAdmin`（登录弹窗 + 密钥验证）
- 路径别名：`@` → `src/`

### 目录结构

```text
web/src/
├── api/                  # Axios 实例 + 按领域拆分的 API 模块
│   ├── index.ts          # Axios 实例、拦截器
│   ├── categories.ts     # 分类 CRUD
│   ├── config.ts         # 站点配置（电话、微信）
│   └── dishes.ts         # 菜品 CRUD + 图片上传
├── components/           # 可复用组件
├── composables/          # 组合式函数（useApi、useAdmin）
├── router/               # 路由配置
├── stores/               # Pinia stores
├── types/                # TypeScript 类型定义
└── views/                # 页面视图
```

## 后端 (`api/`)

- 单文件架构：`src/index.ts`，所有路由集中在一个 Hono 应用中
- Cloudflare Workers 绑定：`DB`（D1）、`IMAGES`（R2）、`ADMIN_SECRET`（secret）、`PUBLIC_R2_URL`（var）、`CONTACT_PHONE`（var）、`CONTACT_WECHAT`（var）
- 路由以 `/api/` 为前缀，另有 `/r2/:filename` 直接提供图片访问
- Zod schema 通过 `@hono/zod-validator` 校验请求体
- `adminAuth` 中间件校验 `x-admin-secret` 请求头与 `ADMIN_SECRET` 绑定值
- 响应格式：成功 `{code: 0, message, data}`，失败 `{code: 1, message, data: null}`

### API 路由

| 方法   | 路径                     | 认证     | 用途         |
| ------ | ------------------------ | -------- | ------------ |
| GET    | `/api/health`            | 无       | 健康检查     |
| GET    | `/api/admin/check`       | adminAuth| 验证管理员   |
| GET    | `/api/categories`        | 无       | 分类列表     |
| POST   | `/api/categories`        | adminAuth| 创建分类     |
| PUT    | `/api/categories/:id`    | adminAuth| 更新分类     |
| DELETE | `/api/categories/:id`    | adminAuth| 删除分类     |
| GET    | `/api/dishes`            | 无       | 菜品列表     |
| POST   | `/api/dishes`            | adminAuth| 创建菜品     |
| PUT    | `/api/dishes/:id`        | adminAuth| 更新菜品     |
| DELETE | `/api/dishes/:id`        | adminAuth| 删除菜品     |
| POST   | `/api/upload`            | adminAuth| 上传图片至R2 |
| GET    | `/api/config`            | 无       | 站点配置     |

## 数据库 (`database/`)

- D1（SQLite），`init.sql` 创建表和种子数据，`migrate.sql` 增量迁移
- `categories`：id（自增主键）、name、sort、created_at
- `dishes`：id（自增主键）、category_id（外键 ON DELETE CASCADE）、name、description、price、image_url、sort、status、is_recommended、is_sold_out、created_at
- 索引：`dishes(category_id)`、`dishes(status)`

## 部署

- `deploy.js`：根目录 Node.js 脚本，处理基础设施初始化、前端部署（Wrangler Pages）、后端部署（Wrangler Workers）
- Wrangler 配置位于 `api/wrangler.toml`，包含 D1 数据库 ID 和 R2 存储桶绑定
