import { query } from "../config/database.js";
const createPayment =async(order_id,amount)=>{
    try {
        const {rows}= await query("INSERT INTO payments (order_id,amount) VALUES ($1,$2) RETURNING id",[order_id,amount]);
        return rows[0].id;
    } catch (error) {
         throw error;
    }
}
const updatePaymentStatus=async (paymentId,status,stripeSessionId,stripePaymentIntentId)=>{
    try {
        const {rows}= await query('UPDATE payments SET status=$1,stripeSessionId=$2,stripePaymentIntentId=$3 WHERE id=$4 RETURNING *',[status,stripeSessionId,stripePaymentIntentId,paymentId] );
        if(rows.lenght==0)throw new Error("update staus wrong");
        return rows[0];
    } catch (error) {
        console.log("updatePaymentStatus",error);
        throw error;
        //error handling remaining
    }
}
const updatePayment=async(paymentId,status,error)=>{
    try {
        const {rows}= await query('UPDATE payments SET status=$1 error_message=$2 WHERE id=$3 RETURNING *',[status,error,paymentId] );
        return rows[0];
    } catch (error) {
        console.log(error);
        //error handling remaining
    }

}
export {createPayment,updatePayment,updatePaymentStatus}