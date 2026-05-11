# 蓉姐私房菜

一个基于 Vue 3 + Hono 的响应式 H5 菜单展示网站，支持分类管理、菜品管理和图片上传。

## 项目结构

```
rongjie-private-kitchen/
├── web/                    # 前端 (Vue 3 + Vite + Vant)
│   ├── src/
│   │   ├── api/           # API 请求封装
│   │   ├── components/    # Vue 组件
│   │   ├── composables/   # 组合式函数
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── types/        # TypeScript 类型
│   │   ├── views/        # 页面视图
│   │   ├── router/       # 路由配置
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── api/                    # 后端 (Hono + Cloudflare Workers)
│   ├── src/
│   │   └── index.ts       # API 入口
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml      # Cloudflare Workers 配置
├── database/
│   └── init.sql           # 数据库初始化脚本
├── package.json           # 根目录 npm workspace 配置
├── .gitignore
└── README.md
```

## 技术栈

### 前端

- Vue 3
- Vite
- TypeScript
- Pinia (状态管理)
- Vue Router
- Axios
- Vant 4 (UI 组件库)

### 后端

- Hono (轻量级 Web 框架)
- TypeScript
- Zod (参数校验)
- Cloudflare Workers

### 云服务

- Cloudflare Pages (前端部署)
- Cloudflare Workers (API 部署)
- Cloudflare D1 (数据库)
- Cloudflare R2 (图片存储)

## 本地开发

### 前置条件

- Node.js >= 18
- npm >= 8
- Wrangler CLI (`npm install -g wrangler`)

### 安装依赖

```bash
# 安装根目录和所有子项目依赖
npm install
```

### 启动开发服务器

```bash
# 启动前端 (端口 3000)
npm dev:web

# 启动后端 (端口 8787)
npm dev:api
```

前端默认代理 `/api` 请求到后端。

### 构建

```bash
# 构建所有项目
npm build
```

## Cloudflare 部署

### 1. 登录 Wrangler

```bash
npx wrangler login
```

### 2. 创建 D1 数据库

```bash
# 创建数据库
npx wrangler d1 create rongjie-db

# 将返回的 database_id 填入 api/wrangler.toml
```

### 3. 初始化数据库

```bash
# 执行 SQL 初始化脚本
npx wrangler d1 execute rongjie-db --file=./database/init.sql
```

### 4. 创建 R2 Bucket

```bash
# 创建图片存储桶
npx wrangler r2 bucket create rongjie-images

# 配置自定义域名 (可选)
# 在 R2 控制台设置自定义域名为 images.rongjie-kitchen.com
```

### 5. 配置环境变量

```bash
# 设置管理员密钥
npx wrangler secret put ADMIN_SECRET
# 输入你的管理员密钥

# 设置 R2 公开访问 URL
# 在 wrangler.toml 的 [vars] 中配置 PUBLIC_R2_URL
```

### 6. 部署 API

```bash
# 部署到 Cloudflare Workers
cd api
npm deploy
```

### 7. 部署前端

#### 方式一：Git 集成部署

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Pages 中创建项目
3. 配置构建命令和输出目录：
   - **Build command**: `npm install && npm --filter web build`
   - **Build output directory**: `web/dist`
4. 绑定 Workers/KV

#### 方式二：手动部署

```bash
# 构建前端
npm --filter web build

# 使用 wrangler pages 部署
npx wrangler pages deploy web/dist --project-name=rongjie-private-kitchen
```

## 管理模式

### 进入管理模式

访问以下 URL 进入管理后台：

```
https://your-site.pages.dev/?admin=YOUR_SECRET_KEY
```

### 功能说明

- **新增分类**：在分类 Tab 区域点击「新增分类」按钮
- **编辑分类**：点击分类右侧的「编辑」按钮
- **删除分类**：点击分类右侧的「删除」按钮（会同时删除该分类下的所有菜品）
- **新增菜品**：在菜品列表底部点击「新增菜品」按钮
- **编辑菜品**：点击菜品卡片右下角的「编辑」按钮
- **删除菜品**：点击菜品卡片右下角的「删除」按钮
- **上传图片**：在编辑菜品时使用图片上传组件（仅支持 JPG、PNG、GIF、WebP 格式，最大 5MB）
- **退出管理模式**：点击页面顶部的「退出」按钮

### 安全说明

- 管理员密钥通过 URL 参数传入，保存到 localStorage
- 所有管理接口需要在请求头中携带 `x-admin-secret`
- 后端通过 Cloudflare Secret `ADMIN_SECRET` 进行验证
- 建议使用强密码，并定期更换

## API 接口

### 公共接口

| 方法 | 路径              | 描述                                   |
| ---- | ----------------- | -------------------------------------- |
| GET  | `/api/categories` | 获取所有分类                           |
| GET  | `/api/dishes`     | 获取所有菜品（可选参数 `category_id`） |
| GET  | `/api/health`     | 健康检查                               |

### 管理接口

需要请求头 `x-admin-secret: YOUR_SECRET_KEY`

| 方法   | 路径                  | 描述                            |
| ------ | --------------------- | ------------------------------- |
| POST   | `/api/categories`     | 新增分类                        |
| PUT    | `/api/categories/:id` | 更新分类                        |
| DELETE | `/api/categories/:id` | 删除分类                        |
| POST   | `/api/dishes`         | 新增菜品                        |
| PUT    | `/api/dishes/:id`     | 更新菜品                        |
| DELETE | `/api/dishes/:id`     | 删除菜品                        |
| POST   | `/api/upload`         | 上传图片（multipart/form-data） |

### 请求/响应格式

**请求格式**：

```json
{
  "name": "热菜",
  "sort": 3
}
```

**响应格式**：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：

```json
{
  "code": 1,
  "message": "错误信息",
  "data": null
}
```

## 数据库设计

### categories 表

| 字段       | 类型    | 描述                     |
| ---------- | ------- | ------------------------ |
| id         | INTEGER | 主键，自增               |
| name       | TEXT    | 分类名称                 |
| sort       | INTEGER | 排序字段，数值越小越靠前 |
| created_at | TEXT    | 创建时间                 |

### dishes 表

| 字段        | 类型    | 描述                   |
| ----------- | ------- | ---------------------- |
| id          | INTEGER | 主键，自增             |
| category_id | INTEGER | 所属分类 ID            |
| name        | TEXT    | 菜品名称               |
| description | TEXT    | 菜品描述               |
| price       | REAL    | 价格                   |
| image_url   | TEXT    | 图片 URL               |
| sort        | INTEGER | 排序字段               |
| status      | INTEGER | 状态（1=上架，0=下架） |
| created_at  | TEXT    | 创建时间               |

## 本地运行命令汇总

```bash
# 安装依赖
npm install

# 启动前端开发服务器 (http://localhost:3000)
npm dev:web

# 启动后端开发服务器 (http://localhost:8787)
npm dev:api

# 构建所有项目
npm build

# 部署 API 到 Cloudflare Workers
npm --filter api deploy

# 部署前端到 Cloudflare Pages
cd web && npx wrangler pages deploy dist
```

## 环境变量

### API (wrangler.toml)

```toml
[vars]
PUBLIC_R2_URL = "https://images.rongjie-kitchen.com"
```

### Workers Secret

```bash
npx wrangler secret put ADMIN_SECRET
```

### 前端 (.env.local)

```env
VITE_API_URL=https://your-api.workers.dev
```

## 注意事项

1. **CORS 配置**：API 已配置允许所有来源的 CORS 访问
2. **图片上传**：只支持 JPG、PNG、GIF、WebP 格式，单文件最大 5MB
3. **数据库**：删除分类会同时删除该分类下的所有菜品
4. **排序**：分类和菜品都通过 `sort` 字段排序，数值越小越靠前
5. **缓存**：建议在 Cloudflare Pages 中配置适当的缓存策略

## License

MIT
