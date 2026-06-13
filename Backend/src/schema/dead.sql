CREATE TABLE IF NOT EXISTS dead (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER REFERENCES orders(id),
  error_message TEXT,
  payload       JSONB,
  created_at    TIMESTAMP DEFAULT NOW()
);