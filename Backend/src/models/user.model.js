import { query } from "../config/database.js";
const insertUser=async (username,password,email,role)=>{
    try {const {rows}= await query('INSERT INTO users (username ,password, email, role) VALUES ($1, $2 ,$3 ,$4) RETURNING * ',[username,password,email,role]);
    return rows[0];}
    catch(err){
        throw err;
    }
}
export {insertUser}