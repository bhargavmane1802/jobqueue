import { query } from "../config/database.js";

export const displayProducts=async(req,res,next)=>{
    try {
        const {id}=req.user;
        const products=await query('select id,title,description,product_images,price from products where seller_id=$1',[id]);
        return res.status(200).json(products.rows);
    } catch (error) {
      console.log('displayProducts');
        next(error)
    }

}
export const productDetails=async(req,res,next)=>{
  try {
    const {productId}=req.params;
    const product =await query('select * from products where id=$1',[productId]);
    if(product.rows.lenght==0) throw new Error("product not found");
    return res.status(200).json({product:product.rows[0]});
  } catch (error) {
    console.log("productDetails");
    next(error);
  }
}
export const createProduct =async(req,res,next)=>{
  try {
    const {title,description,price,stock_quantity}=req.body;
    const {id}=req.user;
    const product=await query('insert into products (seller_id,title,description,price,stock_quantity) values ($1,$2,$3,$4,$5) returning * ',[id,title,description,price,stock_quantity]);
    return res.status(201).json({
      product: product.rows[0]
    });
  } catch (error) {
    console.log("createProduct");
    next(error);
  }
}
