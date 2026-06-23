import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const shipmentQueue=new Queue('shipmentQueue',{connection:redis});
export {shipmentQueue}