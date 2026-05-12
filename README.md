# 蓉姐私房菜

响应式 H5 菜单展示网站，支持分类管理、菜品管理和图片上传。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + TypeScript + Vant 4 |
| 后端 | Hono + TypeScript + Zod |
| 数据库 | Cloudflare D1 (SQLite) |
| 图片存储 | Cloudflare R2 |
| 部署 | Cloudflare Pages + Workers |

## 项目结构

```
├── web/                    # 前端
│   ├── src/
│   │   ├── api/           # Axios 请求封装
│   │   ├── components/    # Vue 组件
│   │   ├── composables/   # 组合式函数
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── views/         # 页面视图
│   │   └── router/        # 路由配置
│   └── functions/         # Cloudflare Pages Functions
├── api/                    # 后端
│   ├── src/index.ts        # API 入口（单文件架构）
│   └── wrangler.toml       # Workers 配置
├── database/
│   └── init.sql            # 数据库初始化脚本
├── deploy.js               # 部署脚本
└── package.json            # npm workspaces 配置
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端（端口 3000，自动代理 /api → 8787）
npm dev:web

# 启动后端（端口 8787）
npm dev:api
```

## 部署

```bash
# 首次初始化（创建 D1、R2、设置密钥）
npm run deploy:init

# 一键部署前端 + 后端
npm run deploy

# 单独部署
npm run deploy:web
npm run deploy:api
```

### 环境变量

| 变量 | 位置 | 说明 |
|------|------|------|
| `ADMIN_SECRET` | `wrangler secret put` | 管理员密钥（生产环境） |
| `ADMIN_SECRET` | `api/.dev.vars` | 管理员密钥（开发环境，不入库） |
| `PUBLIC_R2_URL` | `api/wrangler.toml` | R2 公共访问域名 |

## API 接口

### 公共接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/dishes` | 获取菜品列表（可选 `category_id` 参数） |
| GET | `/api/health` | 健康检查 |

### 管理接口（需 `x-admin-secret` 请求头）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/categories` | 新增分类 |
| PUT | `/api/categories/:id` | 更新分类 |
| DELETE | `/api/categories/:id` | 删除分类（级联删除菜品） |
| POST | `/api/dishes` | 新增菜品 |
| PUT | `/api/dishes/:id` | 更新菜品 |
| DELETE | `/api/dishes/:id` | 删除菜品 |
| POST | `/api/upload` | 上传图片 |

### 响应格式

```json
{ "code": 0, "message": "success", "data": { ... } }
```

## License

MIT
