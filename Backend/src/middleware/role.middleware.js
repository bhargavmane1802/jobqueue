const verifySeller =(req,res,next)=>{
    if(req.user.role !=='seller')return res.status(403).json({message:'you are un authorized'});
    return next();
}
const verifyBuyer =(req,res,next)=>{
    if(req.user.role !=='buyer')return res.status(403).json({message:'you are un authorized'});
    return next();
}
export {verifyBuyer,verifySeller}