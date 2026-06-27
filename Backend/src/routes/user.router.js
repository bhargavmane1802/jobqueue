import { Router } from "express";
import { register, verify ,login} from "../controllers/user.controller.js";
import { loginLimiter, registerLimiter, verifyLimiter } from "../middleware/userRateLimiter.middleware.js";
const userRouter=Router();
userRouter.post('/register',registerLimiter,register);
userRouter.post('/verify',verifyLimiter,verify);
userRouter.post('/login',loginLimiter,login);
export {userRouter}