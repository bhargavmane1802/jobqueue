import { query } from "../config/database.js";

export const displayProducts=async(req,res,next)=>{
    try {
        const {id}=req.user;
        const products=await query('select id,title,description,product_images,price from products where seller_id=$1',[id]);
        return res.status(200).json({products});
    } catch (error) {
        next(error)
    }

}
export const productDetails=async(req,res,next)=>{
  try {
    const {productId}=req.params;
    const product =await query('select * from products where id=$1',[productId]);
    return req.status(200).json({product:product});
  } catch (error) {
    next(err);
  }
}
