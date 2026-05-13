import type { Context, Next } from 'hono';
import type { Env } from './utils';
import { errorResponse } from './utils';

/** 管理员认证中间件，校验 x-admin-secret 请求头 */
export const adminAuth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const secret = c.req.header('x-admin-secret');

  if (!secret) {
    return c.json(errorResponse('Unauthorized: missing admin secret'), 401);
  }

  if (secret !== c.env.ADMIN_SECRET) {
    return c.json(errorResponse('Unauthorized: invalid admin secret'), 401);
  }

  await next();
};
