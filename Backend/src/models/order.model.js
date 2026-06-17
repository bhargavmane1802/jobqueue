import { query } from "../config/database.js";
const createSingleItem=async(customer_id,productId,quantity)=>{
    try{
        const order=await query("INSERT INTO orders (customer_id) VALUES ($1) RETURNING id",[customer_id]);
        const product=await query("select price from products where id=$1",[productId])
        const price=(product.rows[0].price)*quantity;
        const order_item=await query(`Insert into order_items (order_id,product_id,quantity,price) values ($1,$2,$3,$4)`,[order.rows[0].id,productId,quantity,price]);
        return 
    }
    catch(err){
        console.log(err);
        throw err;
    }

}
const updateOrder=async(orderId,status)=>{
    try{
        const {rows}=await query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[status,orderId]);
        return rows[0];
    }
    catch(err){
        throw err;
    }

}
const getOrderById=async(order_id)=>{
    try{const {rows}=await query("SELECT * FROM orders WHERE id=$1",[order_id]);
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
export {createSingleItem,getOrderById,updateOrder};