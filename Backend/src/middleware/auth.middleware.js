import jwt from "jsonwebtoken"
import dotenv from "dotenv/config"
const validate_auth=(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){return res.status(401).redirect('/login')};
        const token=authHeader.split(" ")[1];
        const decoded= jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();
    }
    catch(e){
        console.log("failed to validate user");
        e.message="error in auth validation"
        return res.status(401).redirect("/login");
    }
}
export default validate_auth;