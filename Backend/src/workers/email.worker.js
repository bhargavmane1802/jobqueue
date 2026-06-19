import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { deadQueue } from "../queues/dead.queue.js";
const emailWorker =new Worker('emailQueue',async (job)=>{
    const {userEmail,products}=job.data;
    if(job.name=='orderCreated'){
        const {userEmail,products}=job.data;
        await new Promise((resolve) => {
            setTimeout(resolve, 20000);
        });
        }
        return {success:'created mail success'}
},{connection:redis})

emailWorker.on('completed' ,(job,result)=>{
    const {userEmail,products}=job.data;
    console.log(`email:set a email to the customer ${userEmail} ,product name is ${products}`);
    console.log(result)
})
emailWorker.on('failed',async(job,err)=>{
    await deadQueue.add('emailFailed',job);
    console.log('email failed');
})