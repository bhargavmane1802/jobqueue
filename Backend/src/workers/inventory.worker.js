import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { query } from "../config/database.js";
import { updateInventory } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
const inventoryWorker= new Worker('inventoryQueue',async(job)=>{
   const {productId,quantity}=job.data;
   const res=await updateInventory(productId,quantity);
   return res;
},{connection:redis});

inventoryWorker.on("completed" ,(job,result)=>{
   console.log("inventory updated :",result);
})
inventoryWorker.on("failed",async(job, err)=>{
   await deadQueue.add('failedInventoryUpdate',job);
   console.log("inventory failed",err);
})


