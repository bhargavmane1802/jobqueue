import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const emailQueue=new Queue('emailQueue',{connection:redis});
const addToEmailQueue =()=>{
    emailQueue.add('email',()=>{

    });
}
export {addToEmailQueue,emailQueue}