import { query ,pool } from "../config/database.js";
import Stripe from 'stripe'
import { inventoryCheck } from "../services/inventory.service.js";
import { createItems } from "../models/order.model.js";
import { createPayment, updatePaymentSessionId } from "../models/payment.model.js";
import { payment } from "../services/payment.service.js";
import { paymentQueue } from "../queues/payment.queue.js";



export const getCartItems=async (req,res,next)=>{
    try {
        const {id}=req.user;
        const {rows}=await query(
            'SELECT c.product_id ,c.quantity, p.title, p.product_images, p.price,c.quantity * p.price AS item_total, c.seller_id from cart_items c join products p on c.product_id=p.id where buyer_id=$1 ',[id]);
        const totalCost=rows.reduce((sum,row)=>{return sum+=Number(row.item_total)},0);
        return res.status(200).json({rows,totalCost});
    } catch (error) {
        console.log("getCartItems");
        next(error);
    }
}

// export const addToCart=async(req,res,next)=>{
//     try {
//         const {id}=req.user;
//         const {productId,quantity}=req.body;
//         if (!productId) {
//             return res.status(400).json({
//                 message: "Product ID is required"
//             });
//         }
//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({
//                 message: "Quantity must be greater than 0",
//             });
//         }
//         await query(
//             `INSERT INTO cart_items (buyer_id, product_id, quantity)
//             VALUES ($1, $2, $3)
//             ON CONFLICT (buyer_id, product_id)
//             DO UPDATE
//             SET quantity = cart_items.quantity + EXCLUDED.quantity`,[id, productId, quantity]
//         );
//         return res.status(201).json({message:"added to cart"});
//     } catch (error) {
//         console.log("error at addTOCart");
//         next(error);
//     }
// }
export const updateItem=async(req,res,next)=>{
    try {
        const {id}=req.user;
        const {productId,quantity}=req.body;
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0",
            });
        }
        const result=await query(
            `UPDATE cart_items set quantity =$3 where buyer_id=$1 and product_id=$2 returning *`,[id, productId, quantity]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }
        return res.status(200).json({message:"upadted cart",result:result.rows});
    } catch (error) {
        console.log("error at updateItem");
        next(error);
    }
}
export const removeItem = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        await query(
            `DELETE FROM cart_items
             WHERE buyer_id = $1 AND product_id = $2`,
            [id, productId]
        );

        return res.status(200).json({
            message: "item removed from cart",
        });
    } catch (error) {
        console.log("error at removeItem");
        next(error);
    }
};
export const createOrder = async (req, res, next) => {
    const { id } = req.user;
    let transactionStarted = false;
    const client = await pool.connect();
  try {
    const {id,email}=req.user;
    const {seller_id}=req.body;
    //seller_id is needed 
    await client.query('begin');
    transactionStarted = true;
    const inventory =await inventoryCheck(id,client,seller_id);//reserved all the products stock quantity in reserved stock
    const cost=inventory.reduce((sum,row)=>{
      return sum+=Number(row.cost);
    },0);
    const orderId = await createItems(id,cost,inventory,client,seller_id); //insert in order table and order_items order status payment 
    const paymentId =await createPayment(orderId,cost,client);// created payment with status pending
    const session =await payment(inventory,orderId,email,id,paymentId); //created a stripe session
    await updatePaymentSessionId(paymentId,client,session.id)
    await query('delete from cart_items where buyer_id=$1 and seller_id=$2 ',[id,seller_id]);
    await client.query('commit');
    transactionStarted = false;
    await paymentQueue.add('PaymentExpireCheck',{
                id:session.id,
                paymentId
            },
            {
                delay: 5*60 * 1000, // run after 5 minutes
                attempts: 5,
                backoff: {
                type: 'exponential',
                delay: 2000,
                },

                removeOnComplete: true,
                removeOnFail: false,
            }
        )
    return res.status(201).json({
      orderId,
      paymentId,
      checkoutUrl:session.url
    });
  } catch (err) {
  
    console.log("createOrder");
    if(transactionStarted){await client.query("rollback");}
    return next(err);
  }
  finally { client.release(); }
};