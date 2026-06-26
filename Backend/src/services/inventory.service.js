import { query } from "../config/database.js";
import { emailQueue } from "../queues/email.queue.js";

const inventoryService=async(productId,quantity)=> {
     await new Promise((resolve) => {
      setTimeout(resolve, 5000);
      });
   const result =await query('UPDATE products SET reserved_quantity=reserved_quantity+$1 WHERE id=$2 AND (stock_quantity - reserved_quantity)>=$1  RETURNING *',[quantity,productId])
   if (result.rowCount === 0) {
    throw new Error(`Insufficient stock for product ${productId}`);
  }
    return { reserved: quantity, productId };
}
const inventoryCheck = async (buyerId) => {
  const result = await query(
    `
    WITH cart AS (
      SELECT
        ci.product_id,
        ci.quantity,
        p.title,
        p.price,
        p.stock_quantity,
        p.reserved_quantity
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.buyer_id = $1
      FOR UPDATE OF p
    ),
    unavailable AS (
      SELECT title
      FROM cart
      WHERE (stock_quantity - reserved_quantity) < quantity
    ),
    reserved AS (
      UPDATE products p
      SET reserved_quantity = p.reserved_quantity + c.quantity
      FROM cart c
      WHERE p.id = c.product_id
        AND NOT EXISTS (SELECT 1 FROM unavailable)
      RETURNING
        p.id,
        c.title AS name,
        c.price,
        c.quantity,
        c.quantity * c.price AS cost
    )
    SELECT
      COALESCE(
        (SELECT json_agg(reserved) FROM reserved),
        '[]'::json
      ) AS items,
      COALESCE(
        (SELECT json_agg(title) FROM unavailable),
        '[]'::json
      ) AS unavailable;
    `,
    [buyerId]
  );

  const { items, unavailable } = result.rows[0];
  if (items.length === 0) {
   throw new Error('Cart is empty');
   }
  if (unavailable.length) {
    throw new Error(
      `Insufficient stock for: ${unavailable.join(', ')}`
    );
  }

  return items;
};
const updateInventoryOrder=async(orderId)=> {
   //for all the order_idem with order id =id update product rese_stock -order.item.quantity;
   try {
      const products =await query('UPDATE products p SET reserved_quantity = p.reserved_quantity - o.quantity ,stock_quantity=p.stock_quantity-o.quantity FROM order_items o WHERE o.order_id = $1 AND o.product_id = p.id RETURNING p.title, o.quantity',[orderId]);
      return products.rows;
   } catch (error) {
    throw new Error(`Product not found`);
   } 
}

export {inventoryService,inventoryCheck,updateInventoryOrder}