import { redis } from "../utils/redis.js"; 
import { Queue ,Worker } from "bullmq";
const test=async()=>{
    const test_queue =new Queue('test_queue',{connection:redis});
await test_queue.add('task1',{username:"bhargav",task:"hello every one"});
const worker=new Worker('test_queue',async(job)=>{
    console.log(job.name,job.data);
},{connection:redis});
}
export {test}