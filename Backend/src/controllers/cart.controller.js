import { query } from "../config/database.js";
import Stripe from 'stripe'
import { inventoryCheck } from "../services/inventory.service.js";
import { createItems } from "../models/order.model.js";
import { createPayment } from "../models/payment.model.js";
import { payment } from "../services/payment.service.js";

export const getCartItems=async (req,res,next)=>{
    try {
        const {id}=req.user;
        const {rows}=await query(
            'SELECT c.product_id ,c.quantity, p.title, p.product_images, p.price,c.quantity * p.price AS item_total from cart_items c join products p on c.product_id=p.id where buyer_id=$1 ',[id]);
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
    let transactionStarted = false;
  try {
    const {id,email}=req.user;
    await query('begin');
    transactionStarted = true;
    const inventory =await inventoryCheck(id);//reserved all the products stock quantity in reserved stock
    const cost=inventory.reduce((sum,row)=>{
      return sum+=Number(row.cost);
    },0);
    const orderId = await createItems(id,cost,inventory); //insert in order table and order_items
    const paymentId =await createPayment(orderId,cost);
   //this isnt feasible to hold the db in this state // add a column to the sttore the url of payment . 
    // const stripe = new Stripe(process.env.STRIPE);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   customer_email: email,

    //   line_items: inventory.map(item => ({
    //     price_data: {
    //       currency: 'inr',
    //       product_data: {
    //         name: item.name
    //       },
    //       unit_amount: item.price * 100
    //     },
    //     quantity: item.quantity
    //   })),

    //   mode: 'payment',

    //   success_url:
    //     `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,//redirects to order page

    //   cancel_url:
    //     `${process.env.CLIENT_URL}/payment/cancel`, //redirect to order page

    //   metadata: {
    //     orderId: String(orderId),
    //     paymentId: String(paymentId),
    //     userId: String(id),
    //     userEmail:String(email)
    //   }
    // });
    await query('commit');
    const url =await payment(inventory,orderId,email,id);
    await query(
        `
        UPDATE payments
        SET payment_url = $1
        WHERE id = $2
        `,
        [url, paymentId]
        );

    return res.status(201).json({
      orderId,
      paymentId,
      checkoutUrl:url
    });
  } catch (err) {
  
    console.log("createOrder");
    if(transactionStarted){await query("rollback");}
    return next(err);
  }
};