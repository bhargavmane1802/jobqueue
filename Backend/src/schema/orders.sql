CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  status         VARCHAR(50) DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);