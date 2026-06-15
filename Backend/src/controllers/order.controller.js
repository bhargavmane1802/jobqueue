import { create_order,getOrderById } from "../models/order.model.js";
import { paymentQueue } from "../queues/payment.queue.js";
import {emailQueue} from "../queues/email.queue.js"
import {inventoryQueue} from "../queues/inventory.queue.js"
import { createPayment } from "../models/payment.model.js";
import { inventoryCheck } from "../services/inventory.service.js";
import { query } from "../config/database.js";
const process_new_order = async (req, res, next) => {
  try {
    const { productId, email, amount, quantity,productName } = req.body;

    if (!productId || !email || !amount || !quantity || !productName) {
      return res.status(400).json({
        message: "insufficient information"
      });
    }
    const inventory =await inventoryCheck(productId,quantity);
    const order = await create_order(productId,email, quantity, amount); //insert in order table 
    // create payment too with status pending 
    console.log(order);

    // missing steps are 
    // 1- once order and payment created , server will connect to payment gate way create a session and send it to brwser
    // 2- browser will connect to payment gateway and complete the payment process
    // 3- redirected to payment successful ,the order status will be verifying payment ;
    // 4 - the gateway will send webhook whick will trigger paypemt queue to capture the payment and then the rest of the process   
    await paymentQueue.add('createPayment',{email,productName,amount,quantity,productId,orderId:order.id},{attempts:4,backoff:{ type: 'exponential',delay:2000}});//add to paymentqueue
    return res.status(201).json(order);
  } catch (err) {
    if(err=='Insufficient stock for product')console.log('Insufficient stock for product');
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
export{process_new_order,display_order,displayProducts,productDetails}