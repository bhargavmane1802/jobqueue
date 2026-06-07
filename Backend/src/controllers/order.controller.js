import { create_order,getOrderById } from "../models/order.model.js";
import { paymentQueue } from "../queues/payment.queue.js";
import {emailQueue} from "../queues/email.queue.js"
import {inventoryQueue} from "../queues/inventory.queue.js"
import { createPayment } from "../models/payment.model.js";
const process_new_order = async (req, res, next) => {
  try {
    const { productId, email, amount, quantity,productName } = req.body;

    if (!productId || !email || !amount || !quantity || !productName) {
      return res.status(400).json({
        message: "insufficient information"
      });
    }
//insert order in db orders table
    const order = await create_order(productId,email, quantity, amount);
    await paymentQueue.add('createPayment',{email,amount:amount*quantity,orderId:order.id});//add to paymentqueue
    await inventoryQueue.add('checkInventory',{productId,quantity});
    await emailQueue.add('creationEmail',{email,productName,cost:amount*quantity});
    //order_id,amount in payment    
    return res.status(201).json(order);
  } catch (err) {
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