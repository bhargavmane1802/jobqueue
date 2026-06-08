import { create_order,getOrderById } from "../models/order.model.js";
import { paymentQueue } from "../queues/payment.queue.js";
import {emailQueue} from "../queues/email.queue.js"
import {inventoryQueue} from "../queues/inventory.queue.js"
import { createPayment } from "../models/payment.model.js";
import { inventoryCheck } from "../services/inventory.service.js";
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
    console.log(order);
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
export{process_new_order,display_order}