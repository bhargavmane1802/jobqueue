import { create_order,getOrderById } from "../models/order.model.js";
import { createJob,updateJob,getJobByOrderId } from "../models/job.model.js";
const process_new_order = async (req, res, next) => {
  try {
    const { product_id, email, amount, quantity } = req.body;

    if (!product_id || !email || !amount || !quantity) {
      return res.status(400).json({
        message: "insufficient information"
      });
    }

    const order = await create_order(product_id,email, quantity, amount);
    //just for testing purpose 

    const job=await createJob(order.id,"create_order",{email,quantity,amount});
    // const jobs=await getJobByOrderId(order.id);
    // console.log(jobs);
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