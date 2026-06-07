import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const analyticsQueue=new Queue('analyticsQueue',{connection:redis});
const addToAnalyticsQueue=()=>{
    analyticsQueue.add('inventory',()=>{

    });
}
export{addToAnalyticsQueue,analyticsQueue}