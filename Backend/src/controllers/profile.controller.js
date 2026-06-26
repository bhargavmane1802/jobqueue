import { emailQueue } from "../queues/email.queue.js";
import { redis } from "../utils/redis.js";
import { updateUserPassword } from "../models/user.model.js";
import bcrypt from 'bcrypt';

export const changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id, email } = req.user;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${otp}`, JSON.stringify({ id, hashedPassword }));
    await redis.expire(`otp:${otp}`, 600);
    await emailQueue.add("OTP", { otp, email });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log("changePassword", error);
    next(error);
  }
};

export const verifyPasswordChange = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const data = await redis.get(`otp:${otp}`);
    if (!data) return res.status(404).json({ message: "OTP invalid or expired" });

    const { id, hashedPassword } = JSON.parse(data);
    await updaateUserPassword(id, hashedPassword);
    await redis.del(`otp:${otp}`);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("verifyPasswordChange", error);
    next(error);
  }
};