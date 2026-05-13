-- 为现有数据库添加 is_recommended 和 is_sold_out 字段
ALTER TABLE dishes ADD COLUMN is_recommended INTEGER DEFAULT 0;
ALTER TABLE dishes ADD COLUMN is_sold_out INTEGER DEFAULT 0;

-- 标记招牌菜分类下的菜品为推荐
UPDATE dishes SET is_recommended = 1 WHERE category_id = (SELECT id FROM categories WHERE name = '招牌菜');

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status INTEGER DEFAULT 0,
  remark TEXT,
  total_price REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  dish_id INTEGER,
  dish_name TEXT NOT NULL,
  dish_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
