import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { capturePayment } from "../services/payment.service.js";
import { createPayment, updatePayment } from "../models/payment.model.js";
import { updateOrder } from "../models/order.model.js";
const payment_worker=new Worker("paymentQueue",async(job)=>{
    const {email,amount,orderId} = job.data;
    const result =await capturePayment(amount,orderId);
    const {row} =await createPayment(orderId,amount,result.payment_reference);
    return result;
},{connection:redis}) 
payment_worker.on("completed",async(job,result)=>{
    console.log( result);
    console.log("job completed");
})
payment_worker.on("failed",async(job,err)=>{
    console.log("job failed");
    const res=await updateOrder(job.data.orderId,"failed",err);
    console.log(res,job.data);


})
payment_worker.on("error",async(err)=>{
    console.log(err);
    console.log("job error");
})
export {payment_worker}