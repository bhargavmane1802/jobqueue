import { Router } from "express";
import { register, verify ,login} from "../controllers/user.controller.js";
const userRouter=Router();
userRouter.post('/register',register);
userRouter.post('/verify',verify);
userRouter.post('/login',login);
export {userRouter}