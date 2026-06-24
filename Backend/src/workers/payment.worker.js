import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { createPayment, updatePayment, updatePaymentStatus } from "../models/payment.model.js";
import { updateOrder } from "../models/order.model.js";
import { TransientError } from "../utils/custom.error.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { revertInventory } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
import { query } from "../config/database.js";
import { shipmentQueue } from "../queues/shipment.queue.js";
const payment_worker=new Worker("paymentQueue",async(job)=>{
    console.log(job.name);
    if(job.name=='paymentSuccess'){
        const {orderId ,paymentId,userId,stripeSessionId,stripePaymentIntentId}=job.data;
        if(!orderId || !paymentId ||!userId || !stripeSessionId|| !stripePaymentIntentId) throw new Error(`Missing data`);
        await updatePaymentStatus(paymentId,"paid",stripeSessionId,stripePaymentIntentId);
        return {message:true};
    }
    if(job.name=='refundPayment'){
        const {paymentId,id}=job.data;
        if(!paymentId || !id) throw new Error('MissingData');
        try{await query('begin');
        const payment= await query('update payments set status=$1 where id=$2 and status!=$1 returning id',['refunded',paymentId]);
        if(payment.rows.length==0){await query('commit'); return {success:'duplicate'};};
        //refund function remaining;
        console.log('refund successful');
        await query('commit');}
        catch(err){
            await query('rollback');
            throw err;
        }
        return {success:"updated payment status"};
    }
},{connection:redis});




payment_worker.on("completed",async(job,result)=>{
    if(job.name=='paymentSuccess'){
        const {orderId ,userEmail}=job.data;
        if (result.message){
            await inventoryQueue.add('updateInventory',{orderId,userEmail},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
            await shipmentQueue.add('createShipment',{orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
        }
        console.log('added to inventory and shipment queue')

    }//adds to inventory queue
    if(job.name=='refundPayment'){
        console.log('refund job queue worked');
    }
});



payment_worker.on("failed",async(job,err)=>{
    if(err.message =="Missing data"){console.log("data missing ");return ;}
    console.log(
      `attempt ${job.attemptsMade} of ${job.opts.attempts} failed`,err
    );
    if (job.attemptsMade >= job.opts.attempts){
        await deadQueue.add(job.name,job.data);
        console.log(`payment is failed ,${job.name}`);
    }

})
payment_worker.on("error",async(err)=>{
    console.log("payment error",err);
})
export {payment_worker}