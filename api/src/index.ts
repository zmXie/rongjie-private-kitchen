import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './utils';
import routes from './routes';

const app = new Hono<{ Bindings: Env }>();

// 全局启用 CORS
app.use('/*', cors());

// 挂载所有 /api 路由
app.route('/api', routes);

export default app;
