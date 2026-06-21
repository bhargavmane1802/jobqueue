import { query } from "../config/database.js";

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

export{displaypendingOrders,displaycompletedOrders}