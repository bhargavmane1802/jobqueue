CREATE TABLE IF NOT EXISTS jobs (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER REFERENCES orders(id),
  job_type      VARCHAR(100) NOT NULL,
  status        VARCHAR(50) DEFAULT 'pending',
  attempts      INTEGER DEFAULT 0,
  priority      INTEGER DEFAULT 5,
  error_message TEXT,
  payload       JSONB,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);