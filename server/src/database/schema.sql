-- 커피 주문 앱 데이터베이스 스키마

-- Menus 테이블 생성
CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price INTEGER NOT NULL,
    image_url VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Options 테이블 생성
CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    menu_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- Orders 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_time TIMESTAMP NOT NULL DEFAULT NOW(),
    total_price INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'received',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (status IN ('received', 'in_progress', 'completed'))
);

-- OrderItems 테이블 생성
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    item_price INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id)
);

-- OrderItemOptions 테이블 생성
CREATE TABLE IF NOT EXISTS order_item_options (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders(order_time DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_order_item_options_order_item_id ON order_item_options(order_item_id);

-- 초기 데이터 삽입 (중복 방지)
INSERT INTO menus (name, description, price, image_url, stock) 
VALUES 
  ('아메리카노(ICE)', '시원하고 깔끔한 아이스 아메리카노', 4000, '/images/americano-ice.jpg', 10),
  ('아메리카노(HOT)', '따뜻하고 진한 핫 아메리카노', 4000, '/images/americano-hot.jpg', 10),
  ('카페라떼', '부드럽고 고소한 카페라떼', 5000, '/images/caffe-latte.jpg', 10)
ON CONFLICT (name) DO NOTHING;

-- 옵션 데이터 삽입 (각 메뉴마다 동일한 옵션)
INSERT INTO options (name, price, menu_id)
SELECT '샷 추가', 500, id FROM menus
WHERE NOT EXISTS (
  SELECT 1 FROM options WHERE name = '샷 추가' AND menu_id = menus.id
);

INSERT INTO options (name, price, menu_id)
SELECT '시럽 추가', 0, id FROM menus
WHERE NOT EXISTS (
  SELECT 1 FROM options WHERE name = '시럽 추가' AND menu_id = menus.id
);

