import { query } from "../config/database.js";

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
const inventoryCheck =async(productId,quantity)=> {
   const result =await query('UPDATE products SET reserved_quantity=reserved_quantity+$1 WHERE id=$2 AND (stock_quantity - reserved_quantity)>=$1  RETURNING * ',[quantity,productId])
   if (result.rowCount === 0) {
    throw new Error(`Insufficient stock for product`);
  }
  console.log('check',result.rows[0]);
  return { reserved: quantity, productId };
}
const updateInventory=async(productId,quantity)=> {
  await new Promise((resolve) => {
      setTimeout(resolve, 5000);
      });
   const result =await query('UPDATE products SET reserved_quantity=reserved_quantity-$1 ,stock_quantity=stock_quantity-$1 WHERE id=$2  RETURNING *',[quantity,productId]);
   if (result.rowCount === 0) {
    throw new Error(`Product not found`);
  }
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
export {inventoryService,inventoryCheck,updateInventory,revertInventory}