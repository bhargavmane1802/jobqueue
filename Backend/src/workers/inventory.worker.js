import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { query } from "../config/database.js";
import { updateInventoryOrder } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
import { emailQueue } from "../queues/email.queue.js";
const inventoryWorker= new Worker('inventoryQueue',async(job)=>{
   const {orderId,userEmail}=job.data;
   const products=await updateInventoryOrder(orderId);
   await emailQueue.add("orderCreated",{userEmail,products});
   return true;
},{connection:redis});

inventoryWorker.on("completed" ,(job,result)=>{
   console.log("inventory updated :",result);
})
inventoryWorker.on("failed",async(job, err)=>{
   await deadQueue.add('failedInventoryUpdate',job);
   console.log("inventory failed",err);
})


