import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { query,pool } from "../config/database.js";
import { updateInventoryOrder } from "../services/inventory.service.js";
import { deadQueue } from "../queues/dead.queue.js";
import { emailQueue } from "../queues/email.queue.js";
import { trace } from "../log/trace.js";
const inventoryWorker= new Worker('inventoryQueue',async(job)=>{
   if(job.name=='updateInventory'){
   const {orderId,userEmail}=job.data;
   trace.log("inventory",orderId,`updateInventory event for ${orderId}`,new Date());
   const products=await updateInventoryOrder(orderId);// delete the reserved stocks exuivallent to the order quantity per product
   trace.log("inventory",orderId,`delete the reserved stocks equivalent to the order quantity per product`,new Date());
   // await emailQueue.add("orderCreated",{userEmail,products});// wait till u purchase a domain
   return true;}
   if (job.name === 'cancelOrder') {
      const client = await pool.connect();
      const { orderId,email } = job.data;
      await client.query('BEGIN');
      try {
         const result = await client.query(
            `
            UPDATE orders
            SET status = 'cancelled'
            WHERE id = $1
            AND status = 'cancelling'
            RETURNING id
            `,
            [orderId]
         );
// agar update huaa hi nahi toh revert kyu kerna
         if (result.rowCount === 0) {
            client.query('COMMIT');
            trace.log("inventory",orderId,`${orderId} already processed inventory update`,new Date());

            return true; // already processed
         }

         const {rows} =await client.query(
            `
            UPDATE products p
            SET reserved_quantity =
               GREATEST(0, p.reserved_quantity - i.quantity),
               stock_quantity=p.stock_quantity+i.quantity
            FROM order_items i
            WHERE p.id = i.product_id
            AND i.order_id = $1
            returning p.title,p.price,i.quantity
            `,
            [orderId]
         );
         trace.log("inventory",orderId,`inventory reverted back for ${orderId}`,new Date());
         trace.log("inventory",orderId,`order status updated to cancelled  `,new Date());
         await client.query('COMMIT');
         await emailQueue.add('orderCancelMail',{email,orderId,products:rows});
         return true;
      } catch (err) {
         await query('ROLLBACK');
         err.fun_name="cancle order ->inventory work";
         throw err;
      }
      finally{
         client.release();
      }
   }
   if (job.name === 'cancelPendingOrder') {
      const { email,orderId } = job.data;
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
            trace.log("inventory",orderId,`${orderId} already processed inventory update`,new Date());
            return true; // already processed
         }

         const {rows} =await query(
            `
            UPDATE products p
            SET reserved_quantity =
               GREATEST(0, p.reserved_quantity - i.quantity)
            FROM order_items i
            WHERE p.id = i.product_id
            AND i.order_id = $1
            returning p.title,p.price,i.quantity
            `,
            [orderId]
         );
         trace.log("inventory",orderId,`inventory reverted back for ${orderId}`,new Date());
         trace.log("inventory",orderId,`order status updated to cancelled  `,new Date());
         await query('COMMIT');
         await emailQueue.add('orderCancelMail',{email,orderId,products:rows});
         return true;
      } catch (err) {
         await query('ROLLBACK');
         throw err;
      }
   }
},{connection:redis});

inventoryWorker.on("completed" ,(job,result)=>{
   const {orderId}=job.data;
   if(job.name=="updateInventory")trace.log("inventory",orderId,`inventory updated event completed in inventory worker`,new Date());
   if(job.name=="cancelOrder")trace.log("inventory",orderId,` cancelOrder event completed in inventory worker`,new Date());
   if(job.name=="cancelPendingOrder")trace.log("inventory",orderId,` cancelPendingOrder event completed in inventory worker`,new Date());
   console.log("inventory updated :");
})
inventoryWorker.on("failed",async(job, err)=>{
   const {orderId}=job.data;
   console.log(`attempt ${job.attemptsMade} of ${job.opts.attempts} failed`,err);
   trace.log("inventory",orderId,`attempt ${job.attemptsMade} of ${job.opts.attempts} failed for ${job.name}`,new Date());  
   if(job.attemptsMade==job.opts.attempts)await deadQueue.add('failedInventoryUpdate',{name:job.name,data:job.data});
})


