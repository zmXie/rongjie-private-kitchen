import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../utils';
import { successResponse, errorResponse } from '../utils';
import { adminAuth } from '../middleware';

const orderItemSchema = z.object({
  dish_id: z.number().int().nullable(),
  dish_name: z.string().min(1),
  dish_price: z.number().nonnegative(),
  quantity: z.number().int().positive()
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  remark: z.string().optional(),
  total_price: z.number().nonnegative()
});

const orderStatusSchema = z.object({
  status: z.number().int().min(0).max(3),
  reject_reason: z.string().optional()
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional()
});

const app = new Hono<{ Bindings: Env }>();

/** 创建订单 */
app.post('/', zValidator('json', orderSchema), async c => {
  const db = c.env.DB;
  const body = c.req.valid('json');

  const orderResult = await db
    .prepare('INSERT INTO orders (remark, total_price) VALUES (?, ?)')
    .bind(body.remark || '', body.total_price)
    .run();

  const orderId = orderResult.meta.last_row_id;

  const stmts = body.items.map(item =>
    db
      .prepare('INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity) VALUES (?, ?, ?, ?, ?)')
      .bind(orderId, item.dish_id, item.dish_name, item.dish_price, item.quantity)
  );
  await db.batch(stmts);

  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
  const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(orderId).all();

  return c.json(successResponse({ ...order, items: items.results || [] }), 201);
});

/** 查看订单详情（公开，分享链接） */
app.get('/:id', async c => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  if (!order) {
    return c.json(errorResponse('Order not found'), 404);
  }

  const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all();
  return c.json(successResponse({ ...order, items: items.results || [] }));
});

/** 订单列表（管理员，支持按状态筛选） */
app.get('/', adminAuth, async c => {
  const db = c.env.DB;
  const status = c.req.query('status');

  let query = 'SELECT * FROM orders';
  const params: string[] = [];

  if (status !== undefined && status !== '') {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  const orders = result.results || [];

  const ordersWithItems = await Promise.all(
    orders.map(async (order: any) => {
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
      return { ...order, items: items.results || [] };
    })
  );

  return c.json(successResponse(ordersWithItems));
});

/** 更新订单状态（管理员） */
app.put('/:id/status', adminAuth, zValidator('json', orderStatusSchema), async c => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db.prepare('SELECT id FROM orders WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json(errorResponse('Order not found'), 404);
  }

  if (body.status === 3 && !body.reject_reason?.trim()) {
    return c.json(errorResponse('拒绝接单必须填写原因'), 400);
  }

  const rejectReason = body.status === 3 ? body.reject_reason!.trim() : null;
  await db.prepare('UPDATE orders SET status = ?, reject_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(body.status, rejectReason, id).run();

  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all();

  return c.json(successResponse({ ...order, items: items.results || [] }));
});

/** 提交评价（公开） */
app.post('/:id/review', zValidator('json', reviewSchema), async c => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const order: any = await db.prepare('SELECT status, rating FROM orders WHERE id = ?').bind(id).first();
  if (!order) {
    return c.json(errorResponse('订单不存在'), 404);
  }
  if (order.status !== 2) {
    return c.json(errorResponse('只能评价已完成的订单'), 400);
  }
  if (order.rating !== null) {
    return c.json(errorResponse('该订单已评价'), 400);
  }

  await db.prepare('UPDATE orders SET rating = ?, review = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(body.rating, body.review || null, id).run();

  const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all();

  return c.json(successResponse({ ...updated, items: items.results || [] }));
});

export default app;
