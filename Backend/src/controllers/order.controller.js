import { createItems,getOrderById } from "../models/order.model.js";
import { paymentQueue } from "../queues/payment.queue.js";
import {emailQueue} from "../queues/email.queue.js"
import {inventoryQueue} from "../queues/inventory.queue.js"
import { createPayment } from "../models/payment.model.js";
import { inventoryCheck } from "../services/inventory.service.js";
import { query } from "../config/database.js";
import Stripe from 'stripe'
const createOrder = async (req, res, next) => {
  try {
    let {products} = req.body;// it is a array of obj {productId,quantity}
    const {id,email}=req.user;
    if(products.length==0)return res.status(400).json({message:'Products not found '});
    const validProducts=products.filter((row)=>(row.quantity>0 && row.productId));
    await query('begin');
    const inventory =await inventoryCheck(validProducts);//reserved all the products stock quantity in reserved stock
    const cost=inventory.reduce((sum,row)=>{
      return sum+=Number(row.cost);
    },0);
    const orderId = await createItems(id,cost,inventory); //insert in order table and order_items
    const paymentId =await createPayment(orderId,cost); //status pending 
    const stripe = new Stripe(process.env.STRIPE);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,

      line_items: inventory.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name
          },
          unit_amount: item.price * 100
        },
        quantity: item.quantity
      })),

      mode: 'payment',

      success_url:
        `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,//redirects to order page

      cancel_url:
        `${process.env.CLIENT_URL}/payment/cancel`, //redirect to order page

      metadata: {
        orderId: String(orderId),
        paymentId: String(paymentId),
        userId: String(id),
        userEmail:email
      }
    });

    await query('commit');

    // missing steps are 
    // 1- once order and payment created , server will connect to payment gate way create a session and send it to brwser
    // 2- browser will connect to payment gateway and complete the payment process
    return res.status(201).json({
      orderId,
      paymentId,
      checkoutUrl: session.url
    });
  } catch (err) {
  
    console.log(err);
    await query("rollback");
    return next(err);
  }
};
const display_order=async(req,res,next)=>{
    try{
      const {order_id}=req.params;
      const order=await getOrderById(order_id);
      if(!order){
        return res.status(400).json({message:"Invalid order id"})
      }
      return res.status(200).json({order});
    }
    catch(err){
      return next(err);
    }
}
const displayProducts=async(req,res,next)=>{
  
    try{
      const products=await query('select id,title,description,product_images,price from products');
      return req.status(200).json({products:products});

    }catch(err){
      next(err);
    }
  
}
const productDetails=async(req,res,next)=>{
  try {
    const {productId}=req.params;
    const product =await query('select * from products where id=$1',[productId]);
    return req.status(200).json({product:product});
  } catch (error) {
    next(err);
  }
}
export{createOrder,display_order,displayProducts,productDetails}