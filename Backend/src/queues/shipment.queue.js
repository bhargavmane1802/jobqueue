import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
const shipmentQueue=new Queue('shipmentQueue',{connection:redis});
const addToShipmentQueue =()=>{
    shipmentQueue.add('shipment',()=>{

    });
}
export {shipmentQueue,addToShipmentQueue}