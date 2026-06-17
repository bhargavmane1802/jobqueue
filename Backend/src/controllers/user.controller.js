import { query } from "../config/database.js";
import { insertUser } from "../models/user.model.js";
import { redis } from "../utils/redis.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

const register=async(req,res,next)=>{
    try {
        const {username,email,password,role}=req.body;
        if(!username || !email || !password || !role)return res.status(400).json({message:'insufficient information'});
        if(role!=='seller' && role!='buyer')return res.status(400).json({message:'invalid role information'});
        const {rows}=await query('SELECT id FROM users WHERE username=$1 OR email=$2 ',[username,email]);
        if(rows.length >0)return res.status(409).json({message:'username or mail  already exisits'});
        const hashedPassword=await bcrypt.hash(password,10)
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
        await redis.set(otp,JSON.stringify({username,email,hashedPassword,role}));
        await redis.expire(otp, 300);
        //send a email with otp
        // res.redirect() to otp verification page
    } catch (error) {
        console.log(error);
        next(error);
    }
}
const verify=async(req,res,next)=>{
    try {
        const {otp}=req.body;
        const data=await redis.get(`${otp}`);
        if(!data)return res.status(404).json({message:'otp ivalid or expired'});
        const {username,email,hashedPassword,role}=JSON.parse(data);
        const {rows}=await query('SELECT id FROM users WHERE username=$1 OR email=$2  ',[username,email]);
        if(rows.length>0){
            await redis.del(otp);
            return res.status(409).json({message: "User already verified"});
        }
        const user= await insertUser(username,hashedPassword,email,role);
        await redis.del(otp);
        return res.status(201).json({message:'User Registered'})//redirect to login page
    } catch (error) {
        console.log(error);
        next(error);
    }

}
const login =async(req,res,next)=>{
    try {
        const {username,password}=req.body;
        if(!username || !password) return res.status(400).json({message:'insufficient information'});
        const { rows } = await query(
        'SELECT id, password, email, role FROM users WHERE username = $1',
        [username]);
        if(rows.length===0)return res.status(404).json({message:'user not found'});
        const user=rows[0];
        const check=await bcrypt.compare(password,user.password);
        if(!check)return res.status(401).json({message:'invalid password'});
        const token = jwt.sign({ id: user.id, username:username,role:user.role,email:user.email }, process.env.JWT_KEY, { expiresIn: '3h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        next(error);
    }
    
}
export {register,verify,login}