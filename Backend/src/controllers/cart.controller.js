import { query } from "../config/database.js";

export const getCartItems=async (req,res,next)=>{
    try {
        const {id}=req.user;
        const {rows}=await query(
            'SELECT c.product_id ,c.quantity, p.title, p.product_images, p.price,c.quantity * p.price AS item_total from cart_items c join products p on c.product_id=p.id where buyer_id=$1 ',[id]);
            const totalCost=rows.reduce((sum,row)=>{return sum+=row.item_total},0);
        return res.status(200).json({rows,totalCost});
    } catch (error) {
        console.log("error at getCartItems");
        next(error);
    }
}

export const addToCart=async(req,res,next)=>{
    try {
        const {id}=req.user;
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
        await query(
            `INSERT INTO cart_items (buyer_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (buyer_id, product_id)
            DO UPDATE
            SET quantity = cart_items.quantity + EXCLUDED.quantity`,[id, productId, quantity]
        );
        return res.status(201).json({message:"added to cart"});
    } catch (error) {
        console.log("error at addTOCart");
        next(error);
    }
}
export const updateItem=async(req,res,next)=>{
    try {
        const {id}=req.user;
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
        const result=await query(
            `UPDATE cart_items set quantity =$3 where buyer_id=$1 and product_id=$2 returning *`,[id, productId, quantity]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }
        return res.status(200).json({message:"upadted cart",result:result.rows});
    } catch (error) {
        console.log("error at updateItem");
        next(error);
    }
}
export const removeItem = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        await query(
            `DELETE FROM cart_items
             WHERE buyer_id = $1 AND product_id = $2`,
            [id, productId]
        );

        return res.status(200).json({
            message: "item removed from cart",
        });
    } catch (error) {
        console.log("error at removeItem");
        next(error);
    }
};