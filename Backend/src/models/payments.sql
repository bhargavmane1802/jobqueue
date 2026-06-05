CREATE TABLE IF NOT EXISTS payments (
  id                SERIAL PRIMARY KEY,
  order_id          INTEGER REFERENCES orders(id),
  amount            NUMERIC(10,2) NOT NULL,
  status            VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  error_message     TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);