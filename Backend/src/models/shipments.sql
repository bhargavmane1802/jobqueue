CREATE TABLE IF NOT EXISTS shipments (
  id                 SERIAL PRIMARY KEY,
  order_id           INTEGER REFERENCES orders(id),
  tracking_number    VARCHAR(255),
  carrier            VARCHAR(100),
  status             VARCHAR(50) DEFAULT 'pending',
  estimated_delivery DATE,
  created_at         TIMESTAMP DEFAULT NOW()
);