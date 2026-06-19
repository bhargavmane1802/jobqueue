import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { capturePayment } from "../services/payment.service.js";
import { createPayment, updatePayment, updatePaymentStatus, updateStatus } from "../models/payment.model.js";
import { updateOrder } from "../models/order.model.js";
import { TransientError } from "../utils/custom.error.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { revertInventory } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
const payment_worker=new Worker("paymentQueue",async(job)=>{
    if(job.name=='paymentSucess'){
        const {orderId ,paymentId,userId,stripeSessionId,stripePaymentIntentId}=job.data;
        const result =await updateOrder(orderId,"paid");
        if(!result)return {message:false};
        await updatePaymentStatus(paymentId,"successful",stripeSessionId,stripePaymentIntentId);
        return {message:true}
    }
},{connection:redis}) 
payment_worker.on("completed",async(job,result)=>{
    const {orderId ,userEmail}=job.data;
    if (result.message)await inventoryQueue.add('updateInventory',{orderId,userEmail});//adds to inventory queue
})
payment_worker.on("failed",async(job,err)=>{
    console.log(
      `attempt ${job.attemptsMade} of ${job.opts.attempts} failed`
    );
    if (job.attemptsMade >= job.opts.attempts){
        const res=await updateOrder(job.data.orderId,"paymentFailed",err);
        const inventory=await revertInventory(job.data.productId,job.data.quantity);
        await deadQueue.add('paymentFaliure',job.data);
        console.log("order status is failed , due to payment faliuer",res,inventory);
    }

})
payment_worker.on("error",async(err)=>{
    console.log("payment error",err);
})
export {payment_worker}