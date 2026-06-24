import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { query } from "../config/database.js";
import { updateInventoryOrder } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
import { emailQueue } from "../queues/email.queue.js";
const inventoryWorker= new Worker('inventoryQueue',async(job)=>{
   if(job.name=='updateInventory'){
   const {orderId,userEmail}=job.data;
   const products=await updateInventoryOrder(orderId);
   await emailQueue.add("orderCreated",{userEmail,products});
   return true;}
   if (job.name === 'cancelOrder') {
      const { orderId } = job.data;
      await query('BEGIN');
      try {
         const result = await query(
            `
            UPDATE orders
            SET status = 'cancelled'
            WHERE id = $1
            AND status = 'cancelling'
            RETURNING id
            `,
            [orderId]
         );

         if (result.rowCount === 0) {
            await query('ROLLBACK');
            return true; // already processed
         }

         await query(
            `
            UPDATE products p
            SET reserved_quantity =
               GREATEST(0, p.reserved_quantity - i.quantity),
               stock_quantity=p.stock_quantity+i.quantity
            FROM order_items i
            WHERE p.id = i.product_id
            AND i.order_id = $1
            `,
            [orderId]
         );

         await query('COMMIT');
         return true;
      } catch (err) {
         await query('ROLLBACK');
         throw err;
      }
   }
},{connection:redis});

inventoryWorker.on("completed" ,(job,result)=>{
   console.log("inventory updated :",result);
})
inventoryWorker.on("failed",async(job, err)=>{
   console.log(`attempt ${job.attemptsMade} of ${job.opts.attempts} failed`,err);
   if(job.attemptsMade==job.opts.attempts)await deadQueue.add('failedInventoryUpdate',{name:job.name,data:job.data});
})


