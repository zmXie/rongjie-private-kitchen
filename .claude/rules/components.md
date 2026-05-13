# 组件规范

## 项目组件速查

| 组件             | 用途                                  |
| ---------------- | ------------------------------------- |
| `PageContainer`  | 页面容器，固定 NavBar + 居中 loading  |
| `DishCard`       | 菜品卡片，展示图片、名称、价格        |
| `DishEditor`     | 菜品编辑弹窗，表单创建/修改菜品       |
| `CategoryEditor` | 分类编辑弹窗，表单创建/修改分类       |
| `ImageUploader`  | 图片上传，内置压缩，上传至 R2         |
| `LoadingState`   | 加载状态展示（居中 spinner）          |
| `LoginDialog`    | 管理员登录弹窗，密钥验证              |

## Vant 4 常用组件

| Vant 组件        | 用途                  |
| ---------------- | --------------------- |
| `van-dialog`     | 弹窗/确认框           |
| `van-field`      | 表单输入项            |
| `van-form`       | 表单容器              |
| `van-button`     | 按钮                  |
| `van-icon`       | 图标                  |
| `van-swipe-cell` | 滑动操作（删除/编辑） |
| `van-uploader`   | 文件上传              |
| `van-toast`      | 轻提示                |
| `van-popup`      | 弹出层                |
| `van-loading`    | 加载指示器            |
| `van-empty`      | 空状态                |
| `van-nav-bar`    | 顶部导航栏            |
| `van-tag`        | 标签                  |
| `van-stepper`    | 步进器                |
| `van-switch`     | 开关                  |
| `van-image`      | 图片（含懒加载）      |

## 组合式函数

- `useApi` — 带类型的 CRUD 封装，自动处理加载状态和错误提示
- `useAdmin` — 登录弹窗控制 + 密钥验证 + 管理员状态判断

## 注意事项

- 管理员操作（增删改）使用 `useAdmin` 判断权限，未登录时弹出 `LoginDialog`
- 图片上传统一通过 `ImageUploader` 组件，自动压缩后调用 `POST /api/upload`
- 删除分类会级联删除该分类下所有菜品
