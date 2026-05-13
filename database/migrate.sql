-- 为现有数据库添加 is_recommended 和 is_sold_out 字段
ALTER TABLE dishes ADD COLUMN is_recommended INTEGER DEFAULT 0;
ALTER TABLE dishes ADD COLUMN is_sold_out INTEGER DEFAULT 0;

-- 标记招牌菜分类下的菜品为推荐
UPDATE dishes SET is_recommended = 1 WHERE category_id = (SELECT id FROM categories WHERE name = '招牌菜');
