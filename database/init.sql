-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    sort INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    is_recommended INTEGER DEFAULT 0,
    is_sold_out INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_status ON dishes(status);

-- Insert default categories
INSERT INTO categories (name, sort) VALUES ('招牌菜', 1);
INSERT INTO categories (name, sort) VALUES ('凉菜', 2);
INSERT INTO categories (name, sort) VALUES ('热菜', 3);
INSERT INTO categories (name, sort) VALUES ('汤品', 4);
INSERT INTO categories (name, sort) VALUES ('主食', 5);

-- Insert sample dishes
INSERT INTO dishes (category_id, name, description, price, image_url, sort, is_recommended) VALUES
(1, '红烧肉', '精选五花肉，慢火红烧，肥而不腻', 68, '', 1, 1),
(1, '糖醋排骨', '外酥里嫩，酸甜可口', 58, '', 2, 1),
(2, '凉拌黄瓜', '清脆爽口，开胃小菜', 18, '', 1),
(2, '夫妻肺片', '麻辣鲜香，下饭神器', 48, '', 2),
(3, '宫保鸡丁', '经典川菜，鸡肉嫩滑，花生香脆', 42, '', 1),
(3, '鱼香肉丝', '咸甜酸辣，色泽诱人', 38, '', 2),
(4, '番茄蛋汤', '酸甜开胃，营养丰富', 28, '', 1),
(4, '排骨玉米汤', '鲜美浓郁，滋补养生', 48, '', 2),
(5, '扬州炒饭', '粒粒分明，料足味美', 32, '', 1),
(5, '红油抄手', '皮薄馅嫩，麻辣鲜香', 25, '', 2);
