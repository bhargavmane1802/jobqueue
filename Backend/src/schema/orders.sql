CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  product_id          INTEGER REFERENCES products(id),
  customer_email VARCHAR(255) NOT NULL,
  quantity       NUMERIC(10,2) NOT NULL,
  total_amount   NUMERIC(10,2) NOT NULL,
  status         VARCHAR(50) DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
