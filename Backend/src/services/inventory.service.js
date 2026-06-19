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
const inventoryCheck =async(products)=> {
   const result=await query('UPDATE products p SET reserved_quantity=p.reserved_quantity+v.quantity FROM json_to_recordset($1::json) AS v(productId int, quantity int) where v.productId=p.id AND (p.stock_quantity - p.reserved_quantity)>=v.quantity RETURNING p.id,v.quantity,p.price ,v.quantity*p.price as cost,p.title as name',[JSON.stringify(products)])
   if (result.rowCount !==products.length) {
    throw new Error(`Insufficient stock for product`);
  }
  console.log('inventoryCheck',result.rows[0]);
  return result.rows;
}
const updateInventoryOrder=async(orderId)=> {
   //for all the order_idem with order id =id update product rese_stock -order.item.quantity;
   try {
      const products =await query('UPDATE products p SET reserved_quantity = p.reserved_quantity - o.quantity FROM order_items o WHERE o.order_id = $1 AND o.product_id = p.id RETURNING p.title, o.quantity',[orderId]);
      return products;
   } catch (error) {
    
   } 
   throw new Error(`Product not found`);
    return result.rows;
}
const revertInventory=async(productId,quantity)=> {
   const result = await query(
  `UPDATE products SET reserved_quantity = reserved_quantity - $1 WHERE id = $2  RETURNING *`,[quantity, productId]
);
   if (result.rowCount === 0) {
    throw new Error(`Product not found`);
  }
    return  result.rows;
}
export {inventoryService,inventoryCheck,updateInventoryOrder,revertInventory}