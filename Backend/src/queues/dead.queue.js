import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const deadQueue =new Queue('deadQueue',{connection:redis});
export {deadQueue}