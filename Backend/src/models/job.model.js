import { query } from "../config/database.js" 
import { order_queue } from "../queues/order.queue.js";
const createJob=async(orderId, jobType, payload)=>{
try {
    const {rows}=await query('INSERT INTO jobs (order_id,job_type,payload) VALUES ($1,$2,$3)  RETURNING *',[orderId, jobType,payload]);
    return rows[0];
} catch (error) {
    console.log(error);
    return null;
}
}
const updateJob=async (jobId, status, errorMsg = null)=>{
    try {
         await query(
            `UPDATE jobs
            SET status = $1, error_message = $2, updated_at = NOW()
            WHERE id = $3`,
            [status, errorMsg, jobId]
            );
    } catch (error) {
         console.log(error);
    }
}
const getJobByOrderId=async(orderId)=>{
    try {
        const {rows}=await query('select * from jobs where order_id= $1 ORDER BY created_at ASC',[orderId]);
        return rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export {createJob,updateJob,getJobByOrderId};