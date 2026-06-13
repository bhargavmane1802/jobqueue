CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  customer_id INTEGER NOT NULL REFERENCES users(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price   NUMERIC(10,2) NOT NULL,
  status         VARCHAR(50) DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
