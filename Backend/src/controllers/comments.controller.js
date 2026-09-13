import { query } from "../config/database.js";

export const createComment=async (req,res,next)=>{
    try{
        const {user_id,product_id,comment}=req.body;
        if(!user_id || !product_id || !comment){
            return res.status(422).json({message:'Missing field'});
        }
        const result = await query( `INSERT INTO comments (user_id, product_id, comment) VALUES ($1, $2, $3) RETURNING *`, [user_id, product_id, comment] );
        return res.status(201).json({result:result.rows[0],message: "Comment created"});
    }
    catch(err){
        console.log("createComment->",err.message);
        next(err);
    }
}

export const displayComments=async (product_id)=>{
    try{
        if(!product_id){
            throw new Error("Product ID is required");
        }
        const comments =await query('select c.user_id,c.product_id,c.comment,u.username from comments c join users u on c.user_id=u.id WHERE c.product_id = $1 ORDER BY c.created_at DESC', [product_id]);
        return {comments:comments.rows};
    }
    catch(err){
        console.log('displayComments ->' , err.message);
        throw err;
    }
}