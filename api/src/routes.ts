import { Hono } from 'hono';
import type { Env } from './utils';
import { successResponse } from './utils';
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

// 按领域挂载子路由
routes.route('/categories', categories);
routes.route('/dishes', dishes);
routes.route('/orders', orders);

export default routes;
