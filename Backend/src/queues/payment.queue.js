import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const paymentQueue=new Queue('paymentQueue',{connection:redis});
const addToPaymentQueue =()=>{
    paymentQueue.add('payment',()=>{

    },{connection:redis});
}
export{paymentQueue,addToPaymentQueue}