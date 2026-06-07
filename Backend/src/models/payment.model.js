import { query } from "../config/database.js";
const createPayment =async(order_id,amount,payment_reference)=>{
    try {
        const {rows}= await query("INSERT INTO payments (order_id,amount,payment_reference) VALUES ($1,$2,$3) RETURNING *",[order_id,amount,payment_reference]);
        return rows[0];
    } catch (error) {
        console.log(error);
         throw error;
    }
}
const updatePayment=async(paymentId,status,error)=>{
    try {
        const {rows}= await ('UPDATE payments SET status=$1 error_message=$2 WHERE id=$3 RETURNING *',[status,error,paymentId] );
        return rows[0];
    } catch (error) {
        console.log(error);
        //error handling remaining
    }

}
export {createPayment,updatePayment}