import { query } from "../config/database.js";
import { insertUser } from "../models/user.model.js";
import { emailQueue } from "../queues/email.queue.js";
import { redis } from "../utils/redis.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role)
      return res.status(400).json({ message: "insufficient information" });

    if (role !== "seller" && role !== "buyer")
      return res.status(400).json({ message: "invalid role information" });

    // Validate password BEFORE hitting DB
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const { rows } = await query(
      "SELECT id FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (rows.length > 0)
      return res.status(409).json({ message: "Username or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store user data under namespaced key
    await redis.set(`otp:${otp}`, JSON.stringify({ username, email, hashedPassword, role }));
    await redis.expire(`otp:${otp}`, 600);
    await emailQueue.add("OTP", { otp, email });

    // Tell the frontend OTP was sent — frontend handles the redirect to OTP page
    return res.status(200).json({ message: "OTP sent to your email", email });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const data = await redis.get(`otp:${otp}`);
    if (!data) return res.status(404).json({ message: "OTP invalid or expired" });

    const { username, email, hashedPassword, role } = JSON.parse(data);

    // Race-condition guard: check if user was created between OTP send and verify
    const { rows } = await query(
      "SELECT id FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (rows.length > 0) {
      await redis.del(`otp:${otp}`);
      return res.status(409).json({ message: "User already exists" });
    }

    await insertUser(username, hashedPassword, email, role);
    await redis.del(`otp:${otp}`);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "insufficient information" });

    const { rows } = await query(
      "SELECT id, password, email, role FROM users WHERE username = $1",
      [username]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const check = await bcrypt.compare(password, user.password);
    if (!check) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, username, role: user.role, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "3h" }
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export { register, verify, login };