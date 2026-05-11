import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
  IMAGES: R2Bucket;
  ADMIN_SECRET: string;
  PUBLIC_R2_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

const R2_URL = 'https://images.rongjie-kitchen.com';

const successResponse = <T>(data: T) => ({
  code: 0,
  message: 'success',
  data
});

const errorResponse = (message: string, code = 1) => ({
  code,
  message,
  data: null as null
});

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1).max(50),
  sort: z.number().int().optional()
});

const dishSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  image_url: z.string().optional().nullable(),
  sort: z.number().int().optional(),
  status: z.number().int().optional()
});

// Admin authentication middleware
const adminAuth = async (c: any, next: () => Promise<void>) => {
  const secret = c.req.header('x-admin-secret');

  if (!secret) {
    return c.json(errorResponse('Unauthorized: missing admin secret'), 401);
  }

  if (secret !== c.env.ADMIN_SECRET) {
    return c.json(errorResponse('Unauthorized: invalid admin secret'), 401);
  }

  await next();
};

// Categories API
app.get('/api/categories', async c => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM categories ORDER BY sort ASC, id ASC').all();

  return c.json(successResponse(result.results || []));
});

app.post('/api/categories', adminAuth, zValidator('json', categorySchema), async c => {
  const db = c.env.DB;
  const body = c.req.valid('json');

  const result = await db
    .prepare('INSERT INTO categories (name, sort) VALUES (?, ?)')
    .bind(body.name, body.sort || 0)
    .run();

  const category = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(result.meta.last_row_id).first();

  return c.json(successResponse(category), 201);
});

app.put('/api/categories/:id', adminAuth, zValidator('json', categorySchema), async c => {
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

app.delete('/api/categories/:id', adminAuth, async c => {
  const db = c.env.DB;
  const id = c.req.param('id');

  // First delete all dishes in this category
  await db.prepare('DELETE FROM dishes WHERE category_id = ?').bind(id).run();

  // Then delete the category
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();

  return c.json(successResponse({ deleted: true }));
});

// Dishes API
app.get('/api/dishes', async c => {
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

app.post('/api/dishes', adminAuth, zValidator('json', dishSchema), async c => {
  const db = c.env.DB;
  const body = c.req.valid('json');

  const result = await db
    .prepare(
      `INSERT INTO dishes (category_id, name, description, price, image_url, sort, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(body.category_id, body.name, body.description || '', body.price, body.image_url || '', body.sort || 0, body.status || 1)
    .run();

  const dish = await db.prepare('SELECT * FROM dishes WHERE id = ?').bind(result.meta.last_row_id).first();

  return c.json(successResponse(dish), 201);
});

app.put('/api/dishes/:id', adminAuth, zValidator('json', dishSchema.partial()), async c => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = c.req.valid('json');

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

app.delete('/api/dishes/:id', adminAuth, async c => {
  const db = c.env.DB;
  const id = c.req.param('id');

  await db.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();

  return c.json(successResponse({ deleted: true }));
});

// Image upload API
app.post('/api/upload', adminAuth, async c => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json(errorResponse('No file provided'), 400);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json(errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'), 400);
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return c.json(errorResponse('File too large. Maximum size is 5MB'), 400);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const bucket = c.env.IMAGES;
  await bucket.put(filename, file);

  const imageUrl = `${R2_URL}/${filename}`;

  return c.json(successResponse({ url: imageUrl }), 201);
});

// Health check
app.get('/api/health', c => {
  return c.json(successResponse({ status: 'ok' }));
});

export default app;
