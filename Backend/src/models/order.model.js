import { query } from "../config/database.js";
const createItems = async (customerId, cost, inventory) => {
  try {
    const orderResult = await query(
      `INSERT INTO orders (customer_id, total_cost)
       VALUES ($1, $2)
       RETURNING id`,
      [customerId, cost]
    );

    const orderId = orderResult.rows[0].id;

    const values = [];
    const placeholders = [];

    inventory.forEach((item, index) => {
      const offset = index * 4;

      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`
      );

      values.push(
        orderId,
        item.id,        // product_id
        item.quantity,
        item.cost       // price for this line item
      );
    });

    await query(
      `INSERT INTO order_items
       (order_id, product_id, quantity, price)
       VALUES ${placeholders.join(", ")}`,
      values
    );

    return orderId;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const updateOrder=async(orderId,status)=>{
    try{
        const {rows}=await query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 AND status=$3 RETURNING *',[status,orderId,"pending"]);
        if(rows.length==0)return false;
        console.log("updateOrder success",rows);
        return true;
    }
    catch(err){
        throw err;
    }

}
const getOrderById=async(order_id)=>{
    try{const {rows}=await query("SELECT o.quantity ,o.price,p.title,p.product_images FROM products p join order_items o on p.id=o.product_id and o.order_id=$1 ",[order_id]);
    if(rows.length==0){
        console.log("Order not found");
        return null;
    }
    return rows[0];}
    catch(err){
        console.log(err);
        return null;
    }
}
export {createItems,getOrderById,updateOrder};