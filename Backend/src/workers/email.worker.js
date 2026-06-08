import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { deadQueue } from "../queues/dead.queue.js";
const emailWorker =new Worker('emailQueue',async (job)=>{
    const {email,productName,cost,productId,orderId}=job.data;
    if(job.name=='creationEmail'){
        await new Promise((resolve) => {
            setTimeout(resolve, 20000);
        });
        }
        return {success:'created mail success'}
},{connection:redis})

emailWorker.on('completed' ,(job,result)=>{
    const {email,productName,cost,productId,orderId}=job.data;
    console.log(`email:set a email to the customer ${email} ,product name is ${productName} ${orderId}`);
    console.log(result)
})
emailWorker.on('failed',async(job,err)=>{
    await deadQueue.add('emailFailed',job);
    console.log('email failed');
})