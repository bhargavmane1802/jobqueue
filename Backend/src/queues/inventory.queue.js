import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const inventoryQueue=new Queue('inventoryQueue',{connection:redis});
const addToInventoryQueue =()=>{
    inventoryQueue.add('inventory',()=>{

    });
}
export {addToInventoryQueue,inventoryQueue}