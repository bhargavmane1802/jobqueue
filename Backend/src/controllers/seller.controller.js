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
    const {id}=req.user;
    const product =await query('select * from products where id=$1 and seller_id=$2',[productId,id]);
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
export const updateProduct=async(req,res,next)=>{
  try {
    const {title,description,price,stock_quantity}=req.body;
    const {productId}=req.params;
    if(!title || !description ||  price === undefined ||stock_quantity === undefined || !productId)return res.status(400).json({message:'insufficient data'});
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'invalid price' });
    }

    if (isNaN(stock_quantity) || Number(stock_quantity) < 0) {
      return res.status(400).json({ message: 'invalid stock_quantity' });
    }
    const {id}=req.user;
    const product = await query(
      `UPDATE products
      SET title=$2,
          description=$3,
          price=$4,
          stock_quantity=$5
      WHERE id=$6 AND seller_id=$1
      RETURNING *`,
      [id, title, description, price, stock_quantity, productId]
    );
    if(product.rows.length==0)return res.status(404).json({message:'product not found '});
    return res.status(200).json({
      product: product.rows[0]
    });
  } catch (error) {
    console.log("updateProduct");
    next(error);
  }
}
export const deleteProduct=async(req,res,next)=>{
  try {
    const {productId}=req.params;
    if(!productId)return res.status(400).json({message:'insufficient data'});
    const {id}=req.user;
    const product=await query('delete from products where id=$1 and seller_id=$2  returning id',[productId,id]);
    if(product.rows.length==0)return res.status(404).json({message:'product not found '});
    return res.status(200).json({
      message:"product deleted"
    });
  } catch (error) {
    console.log("deleteProduct");
    next(error);
  }
}
