import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
const inventoryWorker= new Worker('inventoryQueue',async(job)=>{
   try {
     await new Promise((resolve) => {
  setTimeout(resolve, 5000);
});
    console.log("inventory completed");
    return {sucess:true};
   } catch (error) {
    
   }
},{connection:redis});//currenty now from order queue later it will have its own queue
inventoryWorker.on("completed" ,(job,result)=>{
   console.log(result);
})
inventoryWorker.on("failed",(job, err)=>{
   console.log(err);
})


