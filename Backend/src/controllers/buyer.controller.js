import { query } from "../config/database.js";

export const displayProducts=async(req,res,next)=>{
    try{
      const products=await query('select id,title,description,product_images,price from products');
      if(products.rows.length==0)return res.status(404).json({message:'404 no product found '});
      return res.status(200).json({products:products.rows});
    }catch(err){
        console.log("displayProducts")
        next(err);
    }
  
}
export const productDetails=async(req,res,next)=>{
  try {
    const {productId}=req.params;
    if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

    const product =await query('select * from products where id=$1',[productId]);
    if(product.rows.length==0)return res.status(404).json({messsae:'Product Not found'});
    return res.status(200).json({product:product.rows[0]});
  } catch (error) {
    console.log("productDetails")
    next(error);
  }
}
export const addToCart=async (req,res,next)=>{
    try {
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

        const {id}=req.user;
        await query(
            `
            INSERT INTO cart_items (buyer_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (buyer_id, product_id)
            DO UPDATE
            SET quantity = $3
            `,
            [id, productId, quantity]
        );
        return res.status(201).json({message:"added to  card"});

    } catch (error) {
        console.log("addToCart");
        next(err);
    }
}
export const buySingleItem=(req,res,next)=>{
    try {
        const {id}=req.user;
        return res.status(201).json({message:'created order but not yet'});
    } catch (error) {
        console.log("buySingleItem");
        next(err);
    }
}