import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { deadQueue } from "../queues/dead.queue.js";
const orderWorker= new Worker('oderQueue',(job)=>{
    
},{connection:redis}); 