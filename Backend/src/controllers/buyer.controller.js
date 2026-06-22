import { query } from "../config/database.js";
import { createPayment } from "../models/payment.model.js";
import { payment } from "../services/payment.service.js";

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
        next(error);
    }
}
export const buySingleItem=async(req,res,next)=>{
    let transactionStarted = false;
    try {
        const {id,email}=req.user;
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
        await query('begin');
        transactionStarted = true;
        const inventory = await query(
            `
            UPDATE products
            SET reserved_quantity = reserved_quantity + $1
            WHERE id = $2
                AND (stock_quantity - reserved_quantity) >= $1
            RETURNING
                title as name,
                price,
                $1 AS quantity,
                price * $1 AS cost;
            `,
            [quantity, productId]
        );

        if (inventory.rows.length === 0) {
        throw new Error("insufficient stocks available");
        }
        const cost =inventory.rows[0].cost;
        const order=await query('insert into orders (customer_id,total_cost)values ($1,$2) returning id',[id,cost]);
        const order_items=await query('insert into order_items (order_id,product_id,quantity,price) values ($1,$2,$3,$4)',[order.rows[0].id,productId,quantity,inventory.rows[0].price]);
        const paymentId =await createPayment(order.rows[0].id,cost);
        await query('commit');
        transactionStarted = false;
        const url=await payment(inventory.rows,order.rows[0].id,email,id);
        await query(
        `
        UPDATE payments
        SET payment_url = $1
        WHERE id = $2
        `,
        [url, paymentId]
        );

    return res.status(201).json({
      orderId:order.rows[0].id,
      paymentId,
      checkoutUrl:url
    });
    } catch (error) {
        console.log("buySingleItem");
        if(transactionStarted){await query("rollback");}
        next(error);
    }
}