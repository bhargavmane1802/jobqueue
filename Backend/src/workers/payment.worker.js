import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { capturePayment } from "../services/payment.service.js";
import { createPayment, updatePayment } from "../models/payment.model.js";
import { updateOrder } from "../models/order.model.js";
import { TransientError } from "../utils/custom.error.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { revertInventory } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
const payment_worker=new Worker("paymentQueue",async(job)=>{
    const {email,productName,amount,quantity,productId,orderId} = job.data;
    const result =await capturePayment(amount*quantity,orderId);
    const {rows} =await createPayment(orderId,amount*quantity,result.payment_reference);
    return result;
},{connection:redis}) 
payment_worker.on("completed",async(job,result)=>{
    const {email,productName,amount,quantity,productId,orderId} = job.data;
    console.log("payment completed");
    await inventoryQueue.add('checkInventory',{productId,quantity,orderId});//adds to inventory queue
    await emailQueue.add('creationEmail',{email,productName,cost:amount*quantity,productId,orderId});//adds to emailqueue
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