import { query } from "../config/database.js";
import { deadQueue } from "../queues/dead.queue.js";
const createPayment =async(order_id,amount)=>{
    try {
        const {rows}= await query("INSERT INTO payments (order_id,amount) VALUES ($1,$2) RETURNING id",[order_id,amount]);
        return rows[0].id;
    } catch (error) {
        console.log("createPayment")
         throw error;
    }
}
const updatePaymentStatus=async (paymentId,stripeSessionId,stripePaymentIntentId)=>{
    try {
        const {rows}= await query('UPDATE payments SET status=$1,stripeSessionId=$2,stripePaymentIntentId=$3 WHERE id=$4 and status = $5 RETURNING id',['paid',stripeSessionId,stripePaymentIntentId,paymentId,'pending'] );
        if(rows.length==0)throw new Error("payment update staus wrong");
        return rows[0];
    } catch (error) {
        console.log("updatePaymentStatus",error);
        throw error;
    }
}
const updatePaymentStatustToCancelled=async(paymentId)=>{
    try {
        const {rows}= await query('update payments set status=$1 where id=$2',['cancelled',paymentId]);
    } catch (error) {
        console.log("updatePaymentStatustToCancelled");
        await deadQueue.add('updatePaymentStatustToCancelled',{paymentId});
        throw error;
    }

}
export {createPayment,updatePaymentStatus,updatePaymentStatustToCancelled}