import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../utils';
import { successResponse, extractR2Key, deleteR2Image } from '../utils';
import { adminAuth } from '../middleware';

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  sort: z.number().int().optional()
});

const app = new Hono<{ Bindings: Env }>();

/** 获取所有分类（按排序字段升序） */
app.get('/', async c => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM categories ORDER BY sort ASC, id ASC').all();
  return c.json(successResponse(result.results || []));
});

/** 新增分类 */
app.post('/', adminAuth, zValidator('json', categorySchema), async c => {
  const db = c.env.DB;
  const body = c.req.valid('json');

  const result = await db
    .prepare('INSERT INTO categories (name, sort) VALUES (?, ?)')
    .bind(body.name, body.sort || 0)
    .run();

  const category = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json(successResponse(category), 201);
});

/** 更新分类 */
app.put('/:id', adminAuth, zValidator('json', categorySchema), async c => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  await db
    .prepare('UPDATE categories SET name = ?, sort = ? WHERE id = ?')
    .bind(body.name, body.sort || 0, id)
    .run();

  const category = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
  return c.json(successResponse(category));
});

/** 删除分类（级联删除该分类下所有菜品，并清理 R2 图片） */
app.delete('/:id', adminAuth, async c => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const dishes = await db.prepare('SELECT image_url FROM dishes WHERE category_id = ?').bind(id).all();
  for (const dish of dishes.results || []) {
    const key = extractR2Key(dish.image_url as string | null, c.env.PUBLIC_R2_URL);
    if (key) await deleteR2Image(c.env.IMAGES, key);
  }

  await db.prepare('DELETE FROM dishes WHERE category_id = ?').bind(id).run();
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();

  return c.json(successResponse({ deleted: true }));
});

export default app;
