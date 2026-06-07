import { query } from "../config/database.js";
const create_order=async(product_id,email,quantity,amount)=>{
    try{
        const {rows}=await query("INSERT INTO orders (product_id,customer_email,quantity,total_amount) VALUES ($1,$2,$3,$4) RETURNING *",[product_id,email,quantity,amount]);
        return rows[0];
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
export {create_order,getOrderById,updateOrder};