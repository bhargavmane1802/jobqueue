import { query } from "../config/database.js";
import { inventoryQueue } from "../queues/inventory.queue.js";
import { paymentQueue } from "../queues/payment.queue.js";
import { shipmentQueue } from "../queues/shipment.queue.js";

const displaypendingOrders=async(req,res,next)=>{
  try {
    const {id}=req.user;
    const orderItems=await query(`SELECT
    o.id AS orderId,
    o.total_cost,
    o.status,
    json_agg(
        json_build_object(
            'title', p.title,
            'quantity', i.quantity,
            'stock_quantity', p.stock_quantity
        )
    ) AS items
FROM orders o
JOIN order_items i
    ON o.id = i.order_id
JOIN products p
    ON p.id = i.product_id
WHERE o.customer_id = $1 
GROUP BY o.id, o.total_cost`,[id]);
    return res.status(200).json({orderItems:orderItems.rows});
  } catch (error) {
    console.log('displaypendingOrders');
    next(error);
  }
}

const displaycompletedOrders=async(req,res,next)=>{
  try {
    const {id}=req.user;
    const orderItems=await query(`SELECT
    o.id AS orderId,
    o.total_cost,
    o.status,
    json_agg(
        json_build_object(
            'title', p.title,
            'quantity', i.quantity,
            'stock_quantity', p.stock_quantity
        )
    ) AS items
FROM orders o
JOIN order_items i
    ON o.id = i.order_id
JOIN products p
    ON p.id = i.product_id
WHERE o.customer_id = $1 and o.status=$2
GROUP BY o.id, o.total_cost, o.status`,[id,'completed']);
    return res.status(200).json({orderItems:orderItems.rows});
  } catch (error) {
    console.log('displaycompletedOrders');
    next(error);
  }
}

const cancelOrder=async(req,res,next)=>{
    try {
        const {orderId}=req.params;
        const {id}=req.user;
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
        await paymentQueue.add('refundPayment',{paymentId:order.rows[0].payment_id ,id},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, 
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
        await inventoryQueue.add('cancelOrder',{orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, 
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
         await shipmentQueue.add('cancelShipment',{orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, 
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
        return res.status(200).json({message:'Order cancelled'});
    } catch (error) {
        console.log('cancleOrder');
        next(error);
    }
}
// const cancelOrder=async(req,res,next)=>{
//     try {
//         const {orderId}=req.params;
//         const {id}=req.user;
//         if(!orderId)return res.status(400).json({message:'insufficient information '});
// const order = await query(
//         `SELECT
//             p.status AS payment_status,
//             o.status AS order_status,
//             p.id AS payment_id
//         FROM payments p
//         JOIN orders o
//             ON p.order_id = o.id
//             WHERE o.id = $1
//             AND o.customer_id = $2`,
//         [orderId, id]
//     );   
//     if(order.rows.length==0)return res.staus(404).json({message:'Invalid request'});
//         console.log(order.rows[0]);
//     const data=order.rows[0];
//     if(data.payment_status=='pending' && data.order_status=='payment')return res.staus(404).json({message:'Invalid request'});
//     else if(data.payment_status=='paid' ){
//         if(data.order_status=='payment'){}
//         else if(data.order_status=='shipment'){
            
//         }
//     }
//         // await inventoryQueue.add('cancelOrder',{orderId},{
//         //       attempts: 5, // total attempts (1 initial + 4 retries)
//         //       backoff: {
//         //         type: 'exponential',
//         //         delay: 2000, // initial delay: 1 second
//         //       },
//         //       removeOnComplete: true,
//         //       removeOnFail: false,
//         //     });
//         return res.status(200).json({message:'Order cancelled'});
//     } catch (error) {
//         console.log('cancleOrder');
//         next(error);
//     }
// }
export{displaypendingOrders,displaycompletedOrders,cancelOrder}