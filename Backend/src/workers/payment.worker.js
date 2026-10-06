import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { createPayment, updatePaymentStatus, updatePaymentStatustToCancelled } from "../models/payment.model.js";
import { updateOrder, updateOrderStatusShipment, updatestatuscancel } from "../models/order.model.js";
import { TransientError } from "../utils/custom.error.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { deadQueue } from "../queues/dead.queue.js";
import { query } from "../config/database.js";
import { shipmentQueue } from "../queues/shipment.queue.js";
import { refundService } from "../services/payment.service.js";
import Stripe from "stripe";
import { trace } from "../log/trace.js";
const stripe = new Stripe(process.env.STRIPE);

const payment_worker=new Worker("paymentQueue",async(job)=>{
    console.log('jobname:',job.name);
    if(job.name=='paymentSuccess'){
        try{const {userEmail,orderId ,paymentId,userId,stripeSessionId,stripePaymentIntentId}=job.data;
        trace.log("payment",paymentId,"recived and verified payment webhook ",new Date());
        if(!userEmail || !orderId || !paymentId ||!userId || !stripeSessionId|| !stripePaymentIntentId) {
            trace.log("payment",paymentId,"web hook is missing data ",new Date());
            throw new Error(`Missing data`);}
        await updatePaymentStatus(paymentId,stripePaymentIntentId); //set payment status from pending to paid  and insert stripePaymentIntentId
        trace.log("payment",paymentId,"updated payment status from pending to paid and inserted stripePaymentIntentId",new Date());
        await inventoryQueue.add('updateInventory',{orderId,userEmail},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            }); // exhaust the reserved stocks by the order 
         trace.log("payment",paymentId,`added to inventory queue to updateInventory `,new Date());
        await shipmentQueue.add('createShipment',{orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
        }); // create a shipment and make the order status to shipment once the shipment is created 
        trace.log("payment",paymentId,`added to shipment queue `,new Date());
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

    if (job.name === 'refundPayment') {
        // refund request 
        // make a stripe api call to initiate refund paymet status paid , order status cancelling
        // if stripe acccepts the request wait for weeb hook for confirmation paymet status refunding , order status cancelling
            // if(confirmation refund confirmed then refund status to refunded , order staus cancelled )
        // if stripe rejects go to retry
        // if 5 retries failed then add to dead queue and payment sataus refund request failed , order status cancelling
        try {
            const { paymentId, id: orderId } = job.data;

            if (!paymentId || !orderId) {
                
            throw new Error('Missing data');
            }

            const { rows } = await query(
            'SELECT * FROM payments WHERE id = $1',
            [paymentId]
            );

            const payment = rows[0];

            if (!payment) {
            trace.log("payment",paymentId,"Payment not found in refundPayment event ",new Date());
            throw new Error('Payment not found');
            }
            // Idempotency:
            // If refund was already initiated/completed, don't do it again.
            if (
            payment.status === 'refunding' ||
            payment.status === 'refunded'
            ) {
            return { success: 'duplicate' };
            }

            if (payment.status !== 'paid') {
            return { success: 'invalid payment status' };
            }

            // Call Stripe
            const refund = await refundService(payment);
            if (!refund || refund.status !== 'succeeded') {
            trace.log("payment",paymentId,"Stripe refund request failed in refundPayment event ",new Date());
            throw new Error('Stripe refund request failed');
            }
            await query(
            `UPDATE payments
            SET status = $1
            WHERE id = $2`,
            ['refunding', paymentId]
            );
            trace.log("payment",paymentId,"payment refund initiated status updated to refunding in refundPayment event ",new Date());
            return {
            success: 'refund initiated',
            paymentId,
            orderId,
            refundId: refund.id
            };

        } catch (err) {

            if (err.message === 'Missing data') {
            console.log('Data missing:', job.name);

            await deadQueue.add(job.name, job.data);

            return { success: 'failed' };
            }
            // Throwing causes BullMQ to retry the job.
            throw err;
        }
        }


    if(job.name=='PaymentExpireCheck'){
        try {
            const {id,paymentId}=job.data;
            const{rows}=await query('select * from payments where id=$1',[paymentId]);
            const payment=rows[0];
            if (!payment) {
                trace.log("payment",paymentId,`expire check call  `,new Date());
                return;
            }
            if(!(payment.status==='pending')){
                return ;}
            trace.log("payment",paymentId,`Payment is still in pending state`,new Date());
            const session= await stripe.checkout.sessions.retrieve(id);
            const pid=await updatestatuscancel(session.metadata.orderId);//return a paymentid
            if(pid===-1){
                return ;
            }
            await updatePaymentStatustToCancelled(pid);// makes the payment status cancelled but need to change it to expired
            trace.log("payment",paymentId,`payment status updated to expired `,new Date());
            await inventoryQueue.add('cancelPendingOrder',{email:session.metadata.userEmail,orderId:session.metadata.orderId},{
                attempts: 5, // total attempts (1 initial + 4 retries)
                backoff: {
                    type: 'exponential',
                    delay: 2000, // initial delay: 1 second
                },
                removeOnComplete: true,
                removeOnFail: false,
                }); //updates order staus to cancelled and release reserved stocks
            trace.log("payment",paymentId,`added to inventory queue for cancle pending orders from inventory`,new Date()); 
            return ;
        } catch (err) {
            throw err;
        }

    }
    
},{connection:redis});




payment_worker.on("completed",async(job,result)=>{
const {id,paymentId}=job.data;    
if(job.name=='paymentSuccess'){
         trace.log("payment",paymentId,`paymentSuccess completed `,new Date());

    }
    if(job.name=='refundPayment'){
         trace.log("payment",paymentId,`refundPayment completed `,new Date()); 
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