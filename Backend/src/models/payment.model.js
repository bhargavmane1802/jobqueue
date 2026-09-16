import { query } from "../config/database.js";
import { deadQueue } from "../queues/dead.queue.js";

const updatePaymentSessionId=async(paymentId,client,stripeSessionId)=>{
    try {
        const {rows}= await client.query('UPDATE payments SET stripesessionid=$2  WHERE id=$1 returning * ',[paymentId,stripeSessionId] );
        if(rows.length==0)throw new Error("payment update sessionId wrong");
        return rows[0];
    } catch (error) {
        console.log("updatePaymentSessionId",error);
        throw error;
    }
}
const createPayment =async(order_id,amount,client)=>{
    try {
         const { rows } = await client.query(
            `INSERT INTO payments (order_id, amount)
             VALUES ($1, $2)
             RETURNING id`,
            [order_id, amount]
        );
        if(rows.length==0)throw new Error("createPayment wrong");
        return rows[0].id;
    } catch (error) {
        console.log("createPayment")
         throw error;
    }
}
const updatePaymentStatus=async (paymentId,stripePaymentIntentId)=>{
    try {
        const {rows}= await query('UPDATE payments SET status=$1 ,stripepaymentintentid=$4 WHERE id=$2 and status = $3 RETURNING id',['paid',paymentId,'pending',stripePaymentIntentId] );
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
export {createPayment,updatePaymentStatus,updatePaymentStatustToCancelled,updatePaymentSessionId}