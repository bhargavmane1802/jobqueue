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
        const comments =await query('select c.id,c.user_id,c.product_id,c.comment,u.username from comments c join users u on c.user_id=u.id WHERE c.product_id = $1 ORDER BY c.created_at DESC', [product_id]);
        return {comments:comments.rows};
    }
    catch(err){
        console.log('displayComments ->', err.message);
        throw err;
    }
}
export const deleteComment=async(req,res,next)=>{
    try {
        const {id}=req.body;
        if(!id)return res.status(400).json({message:"misssing id "});
        const user_id =req.user.id;
        const result =await query('delete from comments where id=$1 and user_id=$2',[id,user_id]);
        if(result.rowCount==0) return res.status(404).json({message:'Comment not found'});
        return res.status(200).json({message:'deleted successfully'});
        
    } catch (err) {
        console.log("deleteComment->", err.message);
        next(err);
    }
} 

export const updateComment=async (req,res,next)=>{
    try {
        let {id,comment}=req.body;
        comment =comment.trim();
        if(!id || !comment)return res.status(400).json({message:"misssing id "});
        const user_id =req.user.id;
        const result =await query('update comments set comment=$3 where id=$1 and user_id=$2',[id,user_id,comment]);
        if(result.rowCount==0) return res.status(404).json({message:'Comment not found'});
        return res.status(200).json({message:'update successfully'});
        
    } catch (err) {
         console.log("updateComment->", err.message);
        next(err);
    }
}