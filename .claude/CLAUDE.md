# CLAUDE.md

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

## 详细规则

- [架构说明](rules/architecture.md) — Monorepo 结构、前后端架构、数据库、部署
- [开发规范](rules/coding-style.md) — 代码风格、命名约定、样式规范
- [组件规范](rules/components.md) — 组件速查、Vant 组件用法
- [项目配置](rules/project-config.md) — 认证机制、Cloudflare 绑定、API 约定
