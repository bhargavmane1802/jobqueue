import { redis } from "../utils/redis.js";
import { Worker } from "bullmq";
import { updateJob } from "../models/job.model.js";
const payment_worker=new Worker("order_queue",async(job)=>{
    await updateJob(job.data.orderId,"Processing",null);
    return { success: "trial" };
},{connection:redis}) 
payment_worker.on("completed",async(job,result)=>{
    await updateJob(job.data.orderId,"completed",null);
    console.log( result);
    console.log("job completed");
})
payment_worker.on("failed",async(job,err)=>{
    console.log( err);
    console.log("job failed");
})
payment_worker.on("error",async(err)=>{
    console.log(err);
    console.log("job error");
})
export {payment_worker}