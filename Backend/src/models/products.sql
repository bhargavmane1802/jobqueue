CREATE TABLE IF NOT EXISTS products (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  price             NUMERIC(10,2) NOT NULL,
  stock_quantity    INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0
);