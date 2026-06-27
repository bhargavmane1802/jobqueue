import { query } from "../config/database.js";
import { deadQueue } from "../queues/dead.queue.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { paymentQueue } from "../queues/payment.queue.js";
import { shipmentQueue } from "../queues/shipment.queue.js";
import { payment } from "../services/payment.service.js";

// Returns ALL orders for the logged-in buyer, with latest payment info joined
const displayAllOrders = async (req, res, next) => {
  try {
    const { id } = req.user;

    const orderItems = await query(
      `SELECT
        o.id          AS orderid,
        o.total_cost,
        o.status,
        pay.id        AS payment_id,
        pay.status    AS payment_status,
        pay.payment_url,
        json_agg(
          json_build_object(
            'title',    p.title,
            'quantity', i.quantity,
            'price',    i.price
          )
          ORDER BY p.title
        ) AS items
      FROM orders o
      JOIN order_items i  ON o.id = i.order_id
      JOIN products p     ON p.id = i.product_id
      -- LATERAL: always fetch only the most-recent payment per order
      LEFT JOIN LATERAL (
        SELECT id, status, payment_url
        FROM   payments
        WHERE  order_id = o.id
        ORDER  BY id DESC
        LIMIT  1
      ) pay ON true
      WHERE o.customer_id = $1
      GROUP BY o.id, o.total_cost, o.status,
               pay.id, pay.status, pay.payment_url
      ORDER BY o.id DESC`,
      [id]
    );

    return res.status(200).json({ orderItems: orderItems.rows });
  } catch (error) {
    console.log("displayAllOrders");
    next(error);
  }
};

// Always creates a fresh Stripe session and updates payment_url
const retryPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { id, email } = req.user;

    // 1. Verify order belongs to user and is in awaiting-payment state
    const orderCheck = await query(
      `SELECT o.id, o.status, pay.id AS payment_id, pay.status AS payment_status
       FROM   orders o
       LEFT JOIN LATERAL (
         SELECT id, status FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1
       ) pay ON true
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderCheck.rows[0];

    if (order.status !== "payment") {
      return res.status(400).json({ message: "Order is not awaiting payment" });
    }

    if (order.payment_status !== "pending") {
      return res.status(400).json({ message: "Payment is not in pending state" });
    }

    // 2. Fetch order items to rebuild the inventory array for payment()
    const itemsResult = await query(
      `SELECT p.title AS name,
              p.price,
              i.quantity,
              (p.price * i.quantity) AS cost
       FROM   order_items i
       JOIN   products p ON p.id = i.product_id
       WHERE  i.order_id = $1`,
      [orderId]
    );

    // 3. Always create a fresh Stripe session (expires after 1 hour)
    const url = await payment(itemsResult.rows, orderId, email, id,order.payment_id);

    // 4. Save the fresh URL into the payments table
    await query(
      `UPDATE payments SET payment_url = $1 WHERE id = $2`,
      [url, order.payment_id]
    );

    return res.status(200).json({ checkoutUrl: url });
  } catch (error) {
    console.log("retryPayment");
    next(error);
  }
};

const cancelOrder=async(req,res,next)=>{
    try {
        const {orderId}=req.params;
        const {id,email}=req.user;
        if(!orderId)return res.status(400).json({message:'insufficient information '});
        const order =await query(`UPDATE orders o
            SET status = $1
            FROM payments p
            WHERE o.id = $2
            AND o.customer_id = $3
            AND o.status = $4
            AND p.order_id = o.id
            AND p.status = $5
            RETURNING p.id AS payment_id;` ,
            ['cancelling',orderId,id,'shipment','paid']
        );
        if(order.rows.length==0)return res.status(404).json({message:'Invalid request  q'});
        const jobOptions={
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, 
              },
              removeOnComplete: true,
              removeOnFail: false,
            }
        const results =await Promise.allSettled([paymentQueue.add('refundPayment',{paymentId:order.rows[0].payment_id ,id},jobOptions),
         inventoryQueue.add('cancelOrder',{orderId,email},jobOptions,),
         shipmentQueue.add('cancelShipment',{orderId},jobOptions)]);
         const queueNames = [
            'refundPayment',
            'cancelOrder',
            'cancelShipment',
          ];

         const failedJobs = results
          .map((result, index) => ({
            queue: queueNames[index],
            status: result.status,
            reason: result.reason,
          }))
          .filter(job => job.status === 'rejected');

        if (failedJobs.length > 0) {
          await deadQueue.add('cancelOrder', {
            orderId,
            customerId: id,
            failedJobs,
          });
        }
         
        return res.status(200).json({message:'Order cancelled'});
    } catch (error) {
        console.log('cancelOrder');
        next(error);
    }
}

export { displayAllOrders, cancelOrder, retryPayment };