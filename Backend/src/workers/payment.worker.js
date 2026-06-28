import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { createPayment, updatePaymentStatus } from "../models/payment.model.js";
import { updateOrder, updatestatuscancel } from "../models/order.model.js";
import { TransientError } from "../utils/custom.error.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { deadQueue } from "../queues/dead.queue.js";
import { query } from "../config/database.js";
import { shipmentQueue } from "../queues/shipment.queue.js";
import { refundService } from "../services/payment.service.js";
const payment_worker=new Worker("paymentQueue",async(job)=>{
    console.log('jobname:',job.name);
    if(job.name=='paymentSuccess'){
        try{const {userEmail,orderId ,paymentId,userId,stripeSessionId,stripePaymentIntentId}=job.data;
        if(!userEmail || !orderId || !paymentId ||!userId || !stripeSessionId|| !stripePaymentIntentId) throw new Error(`Missing data`);
        await updatePaymentStatus(paymentId,stripeSessionId,stripePaymentIntentId);
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
        return {message:true};}
        catch(err){
            if(err.message =="Missing data"){
                console.log("data missing ",job.name);
                await deadQueue.add(job.name,job.data);
                return {success:'failed'};
            }
            throw err;
        }
    }
    if(job.name=='refundPayment'){

        try{
            const {paymentId,id}=job.data;
            if(!paymentId || !id) throw new Error('Missing data');
            const {rows}=await query('select * from payments where id=$1 and status=$2 ',[paymentId,'refunding']);
            if(rows.length==0)return {success:'duplicate'};
            const refund=await refundService(rows[0]);
            if(refund.status!='succeeded')throw new Error(refund);
            await query('update payments set status=$1 where id=$2',['refunded',paymentId])
            return {success:'refund successful'};
        }
        catch(err){
            if(err.message =="Missing data"){
                console.log("data missing ",job.name);
                await deadQueue.add(job.name,job.data);
                return {success:'failed'};
            }
            throw err;
        }
    }
},{connection:redis});




payment_worker.on("completed",async(job,result)=>{
    if(job.name=='paymentSuccess'){
        const {orderId ,userEmail}=job.data;
        console.log('added to inventory and shipment queue')

    }
    if(job.name=='refundPayment'){
        console.log(result);
        return;
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