import { redis } from "../utils/redis.js"
import { Queue } from "bullmq"
const orderQueue= new Queue("orderQueue",{connection:redis});
export {orderQueue}