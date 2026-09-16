CREATE TABLE IF NOT EXISTS cart_items (
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id) ,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    PRIMARY KEY (buyer_id, product_id)
);