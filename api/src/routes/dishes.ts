import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../utils';
import { successResponse, errorResponse, extractR2Key, deleteR2Image } from '../utils';
import { adminAuth } from '../middleware';

const dishSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  image_url: z.string().optional().nullable(),
  sort: z.number().int().optional(),
  status: z.number().int().optional(),
  is_recommended: z.number().int().optional(),
  is_sold_out: z.number().int().optional()
});

const app = new Hono<{ Bindings: Env }>();

/** 获取菜品列表，支持按分类筛选，仅返回上架状态的菜品 */
app.get('/', async c => {
  const db = c.env.DB;
  const categoryId = c.req.query('category_id');

  let query = 'SELECT * FROM dishes WHERE status = 1';
  const params: string[] = [];

  if (categoryId) {
    query += ' AND category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY sort ASC, id ASC';

  const stmt = db.prepare(query);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  return c.json(successResponse(result.results || []));
});

/** 新增菜品 */
app.post('/', adminAuth, zValidator('json', dishSchema), async c => {
  const db = c.env.DB;
  const body = c.req.valid('json');

  const result = await db
    .prepare(
      `INSERT INTO dishes (category_id, name, description, price, image_url, sort, status, is_recommended, is_sold_out)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.category_id,
      body.name,
      body.description || '',
      body.price,
      body.image_url || '',
      body.sort || 0,
      body.status || 1,
      body.is_recommended || 0,
      body.is_sold_out || 0
    )
    .run();

  const dish = await db.prepare('SELECT * FROM dishes WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json(successResponse(dish), 201);
});

/** 更新菜品（仅更新传入的字段，更换图片时清理旧图） */
app.put('/:id', adminAuth, zValidator('json', dishSchema.partial()), async c => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  // 如果更换了图片（新旧 URL 不同），先从 R2 删除旧图
  if (body.image_url !== undefined) {
    const old = await db.prepare('SELECT image_url FROM dishes WHERE id = ?').bind(id).first();
    if (body.image_url !== (old?.image_url ?? '')) {
      const oldKey = extractR2Key(old?.image_url as string | null, c.env.PUBLIC_R2_URL);
      if (oldKey) await deleteR2Image(c.env.IMAGES, oldKey);
    }
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    values.push(body.name);
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    values.push(body.description);
  }
  if (body.price !== undefined) {
    updates.push('price = ?');
    values.push(body.price);
  }
  if (body.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(body.image_url ?? '');
  }
  if (body.sort !== undefined) {
    updates.push('sort = ?');
    values.push(body.sort);
  }
  if (body.status !== undefined) {
    updates.push('status = ?');
    values.push(body.status);
  }
  if (body.category_id !== undefined) {
    updates.push('category_id = ?');
    values.push(body.category_id);
  }
  if (body.is_recommended !== undefined) {
    updates.push('is_recommended = ?');
    values.push(body.is_recommended);
  }
  if (body.is_sold_out !== undefined) {
    updates.push('is_sold_out = ?');
    values.push(body.is_sold_out);
  }

  if (updates.length > 0) {
    values.push(id);
    await db
      .prepare(`UPDATE dishes SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const dish = await db.prepare('SELECT * FROM dishes WHERE id = ?').bind(id).first();
  return c.json(successResponse(dish));
});

/** 删除菜品（同时清理 R2 图片） */
app.delete('/:id', adminAuth, async c => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const dish = await db.prepare('SELECT image_url FROM dishes WHERE id = ?').bind(id).first();
  const key = extractR2Key(dish?.image_url as string | null, c.env.PUBLIC_R2_URL);
  if (key) await deleteR2Image(c.env.IMAGES, key);

  await db.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();
  return c.json(successResponse({ deleted: true }));
});

export default app;
