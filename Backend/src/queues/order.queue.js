import { redis } from "../utils/redis.js"
import { Queue } from "bullmq"
const order_queue= new Queue("order_queue",{connection:redis});
export {order_queue}