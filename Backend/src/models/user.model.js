import { query } from "../config/database.js";
export const insertUser=async (username,password,email,role)=>{
    try {const {rows}= await query('INSERT INTO users (username ,password, email, role) VALUES ($1, $2 ,$3 ,$4) RETURNING * ',[username,password,email,role]);
    return rows[0];}
    catch(err){
        throw err;
    }
}
export const updateUserPassword=async(id,password)=>{
    try {
        if(!id || !password)throw new Error ('missing id pass');
        const user=await query(`update users set password=$1 where id=$2`,[password,id]);
    } catch (error) {
        throw error;
    }

}