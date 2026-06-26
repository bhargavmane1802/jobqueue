CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  customer_id    INTEGER NOT NULL REFERENCES users(id),
  total_cost     NUMERIC(12,2) NOT NULL,
  status         VARCHAR(50) DEFAULT 'payment',
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);