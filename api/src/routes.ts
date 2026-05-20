import { Hono } from 'hono';
import type { Env } from './utils';
import { successResponse, errorResponse } from './utils';
import { adminAuth } from './middleware';
import categories from './routes/categories';
import dishes from './routes/dishes';
import orders from './routes/orders';

const routes = new Hono<{ Bindings: Env }>();

/** 验证管理员密钥是否有效 */
routes.get('/admin/check', adminAuth, c => {
  return c.json(successResponse({ valid: true }));
});

/** 获取站点配置（公开接口，如联系方式） */
routes.get('/config', c => {
  return c.json(successResponse({
    phone: c.env.CONTACT_PHONE || '',
    wechat: c.env.CONTACT_WECHAT || ''
  }));
});

/** 健康检查 */
routes.get('/health', c => {
  return c.json(successResponse({ status: 'ok' }));
});

/** 上传图片到 R2，校验类型和大小，返回公共访问链接 */
routes.post('/upload', adminAuth, async c => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json(errorResponse('No file provided'), 400);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json(errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'), 400);
  }

  if (file.size > 5 * 1024 * 1024) {
    return c.json(errorResponse('File too large. Maximum size is 5MB'), 400);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  await c.env.IMAGES.put(filename, file, {
    httpMetadata: {
      cacheControl: 'public, max-age=31536000, immutable',
      contentType: file.type
    }
  });

  const imageUrl = `${c.env.PUBLIC_R2_URL}/${filename}`;
  return c.json(successResponse({ url: imageUrl }), 201);
});

// 按领域挂载子路由
routes.route('/categories', categories);
routes.route('/dishes', dishes);
routes.route('/orders', orders);

export default routes;
