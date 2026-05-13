# 项目配置

## 认证机制

- 管理员密钥存于 localStorage（键名 `admin-secret`），通过 `x-admin-secret` 请求头发送
- 后端 `adminAuth` 中间件校验请求头与 `ADMIN_SECRET` 环境变量
- 登录入口：首页触发 `LoginDialog` 弹窗，不使用 URL 参数
- `GET /api/admin/check` 验证密钥有效性

## Cloudflare Workers 绑定

| 绑定名          | 类型     | 用途                       |
| --------------- | -------- | -------------------------- |
| `DB`            | D1       | SQLite 数据库              |
| `IMAGES`        | R2       | 图片存储桶                 |
| `ADMIN_SECRET`  | secret   | 管理员密钥                 |
| `PUBLIC_R2_URL` | var      | R2 公开访问域名            |
| `CONTACT_PHONE` | var      | 联系电话                   |
| `CONTACT_WECHAT`| var      | 微信号                     |

## API 约定

- 响应统一格式：成功 `{code: 0, message, data}`，失败 `{code: 1, message, data: null}`
- 前端拦截器自动解包，API 调用直接拿到 `data`
- 管理接口需要 `x-admin-secret` 请求头，公共接口（GET categories/dishes、health、config）不需要
- 图片上传：`POST /api/upload` → R2，访问：`/r2/:filename` 或自定义 R2 域名
- 分类和菜品按 `sort ASC, id ASC` 排序

## 开发代理

Vite 开发服务器（端口 3000）将 `/api` 代理至 `http://127.0.0.1:8787`（Wrangler 开发服务器）。
