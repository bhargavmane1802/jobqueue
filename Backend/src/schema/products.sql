CREATE TABLE IF NOT EXISTS products (
    id                SERIAL PRIMARY KEY,
    seller_id         INTEGER NOT NULL REFERENCES users(id),

    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    product_images    TEXT[],
    slug              VARCHAR(255) UNIQUE,

    price             NUMERIC(10,2) NOT NULL,
    stock_quantity    INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,

    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);