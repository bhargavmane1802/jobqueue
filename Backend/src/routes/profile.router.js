import { Router } from "express";
import { changePassword, verifyPasswordChange } from "../controllers/profile.controller.js";
export const profileRouter =Router();
profileRouter.post('/change/password',changePassword);
profileRouter.patch('/verify/otp',verifyPasswordChange);
