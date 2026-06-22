import { query } from "../config/database.js";
import { inventoryQueue } from "../queues/inventory.queue.js";

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
WHERE o.customer_id = $1 and o.status=$2
GROUP BY o.id, o.total_cost, o.status`,[id,'pending']);
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
        const order =await query('update orders set status=$1 where id=$2 and customer_id =$3 and status!=$1 and status!=$4 and status!=$5 returning id' ,['cancelling',orderId,id,'cancelled','completed']);
        if(order.rows.length==0)return res.staus(404).json({message:'Invalid request'});
        await inventoryQueue.add('cancelOrder',{orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
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

export{displaypendingOrders,displaycompletedOrders,cancelOrder}